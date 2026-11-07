import mongoose, { Types } from "mongoose";

import { assertLocalMongoUri, LOCAL_DATABASE } from "./t3BackupUtils";

interface AnswerReference {
  candidateAnswerId: Types.ObjectId;
  answerId: Types.ObjectId;
}

function keyOf(fileKey: unknown, userId: unknown, interviewId: unknown, questionId: unknown) {
  return [fileKey, userId, interviewId, questionId].map((value) => String(value || "")).join("|");
}

async function migrate() {
  const mongoUri = assertLocalMongoUri();
  await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB_NAME || LOCAL_DATABASE });
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection was not initialized");

  const candidateAnswers = db.collection("candidateanswers");
  const processedInterviews = db.collection("processed_interviews");
  const references = new Map<string, AnswerReference[]>();

  const candidateCursor = candidateAnswers.find(
    { "interiewAnswers.0": { $exists: true } },
    { projection: { _id: 1, userId: 1, interviewId: 1, interiewAnswers: 1 } },
  );
  for await (const candidateAnswer of candidateCursor) {
    for (const answer of candidateAnswer.interiewAnswers || []) {
      if (!answer?._id || !answer.fileKey) continue;
      const key = keyOf(answer.fileKey, candidateAnswer.userId, candidateAnswer.interviewId, answer.questionId);
      const items = references.get(key) || [];
      items.push({ candidateAnswerId: candidateAnswer._id, answerId: answer._id });
      references.set(key, items);
    }
  }
  for (const items of references.values()) {
    items.sort((left, right) => left.answerId.toString().localeCompare(right.answerId.toString()));
  }

  const existing = await processedInterviews
    .find(
      { candidateAnswerId: { $exists: true }, answerId: { $exists: true } },
      { projection: { candidateAnswerId: 1, answerId: 1 } },
    )
    .toArray();
  const used = new Set(existing.map((item) => `${item.candidateAnswerId}|${item.answerId}`));
  const pendingByKey = new Map<string, any[]>();
  const pendingCursor = processedInterviews.find({
    $or: [{ candidateAnswerId: { $exists: false } }, { answerId: { $exists: false } }],
  });
  for await (const result of pendingCursor) {
    const key = keyOf(result.fileKey, result.userId, result.interviewId, result.questionId);
    const items = pendingByKey.get(key) || [];
    items.push(result);
    pendingByKey.set(key, items);
  }

  const operations: any[] = [];
  for (const [key, results] of pendingByKey) {
    results.sort((left, right) => {
      const dateOrder = new Date(left.processedAt || 0).getTime() - new Date(right.processedAt || 0).getTime();
      return dateOrder || left._id.toString().localeCompare(right._id.toString());
    });
    const available = (references.get(key) || []).filter(
      (item) => !used.has(`${item.candidateAnswerId}|${item.answerId}`),
    );
    if (!available.length || available.length > results.length) {
      throw new Error(
        `Unable to map processed results safely for ${key}: ${results.length} result(s), ${available.length} answer(s)`,
      );
    }
    const legacyDuplicateCount = results.length - available.length;
    results.forEach((result, index) => {
      // Two historical answers were evaluated twice although only the latest
      // answer identity survives in candidateanswers. Keep every result: the
      // newest result receives the real answer id, while each older duplicate
      // receives its own stable ObjectId and retains sourceAnswerId for audit.
      const isLegacyDuplicate = index < legacyDuplicateCount;
      const reference = available[Math.max(0, index - legacyDuplicateCount)];
      const answerId = isLegacyDuplicate ? result._id : reference.answerId;
      used.add(`${reference.candidateAnswerId}|${answerId}`);
      operations.push({
        updateOne: {
          filter: { _id: result._id },
          update: {
            $set: {
              candidateAnswerId: reference.candidateAnswerId,
              answerId,
              ...(isLegacyDuplicate
                ? {
                    sourceAnswerId: reference.answerId,
                    compatibilityMapping: "legacy-duplicate",
                  }
                : {}),
              compatibilityMigratedAt: new Date(),
            },
          },
        },
      });
    });
  }

  for (let offset = 0; offset < operations.length; offset += 500) {
    await processedInterviews.bulkWrite(operations.slice(offset, offset + 500), { ordered: true });
  }

  const unmapped = await processedInterviews.countDocuments({
    $or: [{ candidateAnswerId: { $exists: false } }, { answerId: { $exists: false } }],
  });
  if (unmapped) throw new Error(`${unmapped} processed interview result(s) remain unmapped`);

  const duplicate = await processedInterviews
    .aggregate([
      { $group: { _id: { candidateAnswerId: "$candidateAnswerId", answerId: "$answerId" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 },
    ])
    .next();
  if (duplicate) throw new Error("Duplicate candidateAnswerId + answerId result detected");

  await processedInterviews.createIndex(
    { candidateAnswerId: 1, answerId: 1 },
    {
      name: "candidateAnswer_answer_unique",
      unique: true,
      partialFilterExpression: {
        candidateAnswerId: { $type: "objectId" },
        answerId: { $type: "objectId" },
      },
    },
  );

  console.log(`T3 compatibility migration complete: ${operations.length} result(s) updated, ${unmapped} unmapped.`);
}

migrate()
  .catch((error) => {
    console.error(`T3 compatibility migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
