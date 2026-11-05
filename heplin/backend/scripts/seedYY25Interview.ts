import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import {
  loadYY25ResponseManifest,
  parseYY25Workbook,
} from "./yy25InterviewWorkbook";
import { inspectYY25Video } from "./yy25VideoFile";

const CANDIDATE_EMAIL = "candidate@heplin.local";
const TENANT_SUBDOMAIN = "demo";

async function upsertAndGet(
  collection: any,
  filter: Record<string, any>,
  values: Record<string, any>,
  insertOnly: Record<string, any> = {},
) {
  const now = new Date();
  await collection.updateOne(
    filter,
    {
      $set: { ...values, updatedAt: now },
      $setOnInsert: { ...insertOnly, createdAt: now },
    },
    { upsert: true },
  );

  const document = await collection.findOne(filter);
  if (!document) {
    throw new Error(`YY'25 seed failed for ${collection.collectionName}`);
  }
  return document;
}

async function seedYY25Interview() {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || "heplin-local";
  if (!mongoUri || !/localhost|127\.0\.0\.1/.test(mongoUri)) {
    throw new Error("seed:yy25-interview:local only accepts a localhost MongoDB URI");
  }

  const questionsFromWorkbook = parseYY25Workbook();
  const manifest = loadYY25ResponseManifest();
  const uploadDirectory = path.resolve(process.env.LOCAL_UPLOAD_DIR || ".local-uploads");
  const videoMetadata = [];
  for (const response of manifest.responses) {
    const videoPath = path.join(uploadDirectory, response.fileKey);
    if (!fs.existsSync(videoPath)) {
      throw new Error(
        `Missing generated video ${response.fileKey}. Run npm run generate:yy25-videos:local first.`,
      );
    }
    videoMetadata.push(await inspectYY25Video(videoPath));
  }

  await mongoose.connect(mongoUri, { dbName });
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection was not initialized");

  const tenant = await db.collection("tenants").findOne({
    subdomain: TENANT_SUBDOMAIN,
    isDeleted: { $ne: true },
  });
  const user = await db.collection("users").findOne({
    email: CANDIDATE_EMAIL,
    isDeleted: { $ne: true },
  });
  if (!tenant || !user) {
    throw new Error("Run npm run seed:local before seeding the YY'25 interview");
  }

  const candidate = await db.collection("candidates").findOne({
    tenantId: tenant._id,
    userId: user._id,
    isDeleted: { $ne: true },
  });
  const job = await db.collection("jobs").findOne({
    tenantId: tenant._id,
    slug: "senior-typescript-developer-local",
    isDeleted: { $ne: true },
  });
  if (!candidate || !job) throw new Error("Local demo candidate or job was not found");

  const application = await db.collection("jobapplications").findOne({
    candidateId: candidate._id,
    jobId: job._id,
    isDeleted: { $ne: true },
  });
  if (!application) throw new Error("Local demo application was not found");

  const interview = await upsertAndGet(
    db.collection("interviews"),
    { tenantId: tenant._id, name: manifest.interviewName },
    {
      tenantId: tenant._id,
      name: manifest.interviewName,
      description: "YY'25 çalışma kitabındaki sorularla yerel video ve toplu değerlendirme testi.",
      isDeleted: false,
    },
  );

  const interviewQuestionsCollection = db.collection("interviewquestions");
  const existingQuestionSet = await interviewQuestionsCollection.findOne({
    tenantId: tenant._id,
    interviewId: interview._id,
  });
  const questions = questionsFromWorkbook.map((definition, index) => ({
    _id: existingQuestionSet?.questions?.[index]?._id || new mongoose.Types.ObjectId(),
    question: definition.question,
    duration: 1,
    evaluationCriteria: definition.evaluationCriteria,
    category: definition.category,
    competency: definition.competency,
    audioKey: "",
  }));

  await upsertAndGet(
    interviewQuestionsCollection,
    { tenantId: tenant._id, interviewId: interview._id },
    {
      tenantId: tenant._id,
      interviewId: interview._id,
      questions,
      isDeleted: false,
    },
  );

  const candidateAnswersCollection = db.collection("candidateanswers");
  const existingCandidateAnswers = await candidateAnswersCollection.findOne({
    userId: user._id,
    interviewId: interview._id,
  });
  const existingAnswers = existingCandidateAnswers?.interiewAnswers || [];
  const answers = questions.map((question, index) => {
    const response = manifest.responses[index];
    const previous = existingAnswers.find(
      (item: any) => String(item.questionId) === String(question._id),
    ) || existingAnswers[index];
    return {
      _id: previous?._id || new mongoose.Types.ObjectId(),
      questionId: String(question._id),
      question: question.question,
      fileKey: response.fileKey,
      responseTime: Math.ceil(videoMetadata[index].durationSeconds),
    };
  });

  const candidateAnswers = await upsertAndGet(
    candidateAnswersCollection,
    { userId: user._id, interviewId: interview._id },
    {
      userId: user._id,
      interviewId: interview._id,
      jobApplicationId: application._id,
      jobId: job._id,
      interiewAnswers: answers,
      isDeleted: false,
    },
  );

  const now = new Date();
  const candidateInterview = await upsertAndGet(
    db.collection("candidateinterviews"),
    { userId: user._id, interviewId: interview._id },
    {
      name: manifest.interviewName,
      userId: user._id,
      jobApplicantId: application._id,
      candidateAnswersId: candidateAnswers._id,
      candidateId: candidate._id,
      jobId: job._id,
      interviewId: interview._id,
      interviewType: "video",
      totalDuration: questions.length,
      expirationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      questionIndex: questions.length,
      status: "completed",
      isStart: true,
      startDate: now,
      accessLocked: false,
      mailSent: false,
      isEvaluated: false,
      interviewEvaluate: {},
      evaluationScore: null,
      isDeleted: false,
    },
  );

  console.log("YY'25 local video interview is ready.");
  console.log(`Candidate: ${CANDIDATE_EMAIL}`);
  console.log(`Interview ID: ${candidateInterview._id}`);
  console.log(`Candidate answer ID: ${candidateAnswers._id}`);
  console.log(`Accounts: http://localhost:5174/interviews/${candidateInterview._id}`);
  console.log("Company: http://localhost:5173/demo");
  console.table(
    answers.map((answer, index) => ({
      question: index + 1,
      targetLevel: manifest.responses[index].targetLevel,
      answerId: String(answer._id),
      fileKey: answer.fileKey,
      responseTime: answer.responseTime,
    })),
  );
}

seedYY25Interview()
  .catch((error) => {
    console.error(`YY'25 interview seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
