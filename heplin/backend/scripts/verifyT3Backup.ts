import mongoose from "mongoose";

import { assertLocalMongoUri, EXPECTED_T3_COUNTS, LOCAL_DATABASE } from "./t3BackupUtils";

async function verify() {
  const mongoUri = assertLocalMongoUri();
  await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB_NAME || LOCAL_DATABASE });
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection was not initialized");

  const [collections, users, candidateAnswers, processed, answerItems, statuses, unmapped, invalidLegacyDuplicates, admin, tenant] =
    await Promise.all([
      db.listCollections({}, { nameOnly: true }).toArray(),
      db.collection("users").countDocuments(),
      db.collection("candidateanswers").countDocuments(),
      db.collection("processed_interviews").countDocuments(),
      db.collection("candidateanswers").aggregate([
        { $project: { count: { $size: { $ifNull: ["$interiewAnswers", []] } } } },
        { $group: { _id: null, count: { $sum: "$count" } } },
      ]).next(),
      db.collection("processed_interviews").aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]).toArray(),
      db.collection("processed_interviews").countDocuments({
        $or: [{ candidateAnswerId: { $exists: false } }, { answerId: { $exists: false } }],
      }),
      db.collection("processed_interviews").countDocuments({
        compatibilityMapping: "legacy-duplicate",
        $or: [
          { sourceAnswerId: { $exists: false } },
          { candidateAnswerId: { $exists: false } },
          { answerId: { $exists: false } },
        ],
      }),
      db.collection("users").findOne({ email: "admin@heplin.local", status: "active" }),
      db.collection("tenants").findOne({ subdomain: "t3-vakfi", status: "active" }),
    ]);

  const statusMap = Object.fromEntries(statuses.map((item) => [item._id, item.count]));
  const failures: string[] = [];
  if (collections.length !== EXPECTED_T3_COUNTS.collections) failures.push(`collections=${collections.length}`);
  if (users < EXPECTED_T3_COUNTS.users + 1) failures.push(`users=${users}`);
  if (candidateAnswers !== EXPECTED_T3_COUNTS.candidateanswers) failures.push(`candidateanswers=${candidateAnswers}`);
  if (answerItems?.count !== EXPECTED_T3_COUNTS.candidateAnswerItems) failures.push(`answerItems=${answerItems?.count}`);
  if (processed !== EXPECTED_T3_COUNTS.processedInterviews) failures.push(`processed=${processed}`);
  if (statusMap.SUCCESS !== EXPECTED_T3_COUNTS.processedSuccess) failures.push(`success=${statusMap.SUCCESS}`);
  if (statusMap.FAILED !== EXPECTED_T3_COUNTS.processedFailed) failures.push(`failed=${statusMap.FAILED}`);
  if (unmapped !== 0) failures.push(`unmapped=${unmapped}`);
  if (invalidLegacyDuplicates !== 0) failures.push(`invalidLegacyDuplicates=${invalidLegacyDuplicates}`);
  if (!admin) failures.push("local admin missing");
  if (!tenant) failures.push("t3-vakfi tenant missing");

  const indexes = await db.collection("processed_interviews").indexes();
  if (!indexes.some((index) => index.name === "candidateAnswer_answer_unique" && index.unique)) {
    failures.push("processed interview unique index missing");
  }

  if (failures.length) throw new Error(`Verification mismatch: ${failures.join(", ")}`);
  console.log("T3 local database verification passed.");
  console.table({
    collections: collections.length,
    users,
    candidateAnswers,
    answerItems: answerItems?.count,
    processedInterviews: processed,
    success: statusMap.SUCCESS,
    failed: statusMap.FAILED,
    unmapped,
    legacyDuplicates: await db.collection("processed_interviews").countDocuments({
      compatibilityMapping: "legacy-duplicate",
    }),
  });
}

verify()
  .catch((error) => {
    console.error(`T3 local database verification failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
