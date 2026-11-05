import mongoose from "mongoose";

const CANDIDATE_EMAIL = "candidate@heplin.local";
const TENANT_SUBDOMAIN = "demo";
const INTERVIEW_NAME = "Yerel Video Mülakat Testi";

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
    throw new Error(`Interview assignment failed for ${collection.collectionName}`);
  }

  return document;
}

async function assignLocalInterview() {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || "heplin-local";

  if (!mongoUri || !/localhost|127\.0\.0\.1/.test(mongoUri)) {
    throw new Error("assign-interview:local only accepts a localhost MongoDB URI");
  }

  await mongoose.connect(mongoUri, { dbName });
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection was not initialized");
  }

  const tenant = await db.collection("tenants").findOne({
    subdomain: TENANT_SUBDOMAIN,
    isDeleted: { $ne: true },
  });
  const user = await db.collection("users").findOne({
    email: CANDIDATE_EMAIL,
    isDeleted: { $ne: true },
  });

  if (!tenant || !user) {
    throw new Error("Run npm run seed:local before assigning the interview");
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

  if (!candidate || !job) {
    throw new Error("Local candidate or demo job was not found");
  }

  const application = await db.collection("jobapplications").findOne({
    candidateId: candidate._id,
    jobId: job._id,
    isDeleted: { $ne: true },
  });

  if (!application) {
    throw new Error("Local demo application was not found");
  }

  const interview = await upsertAndGet(
    db.collection("interviews"),
    { tenantId: tenant._id, name: INTERVIEW_NAME },
    {
      tenantId: tenant._id,
      name: INTERVIEW_NAME,
      description: "Yerel video kayıt ve yükleme akışını test etmek için oluşturuldu.",
      isDeleted: false,
    },
  );

  const interviewQuestions = db.collection("interviewquestions");
  const existingQuestions = await interviewQuestions.findOne({
    tenantId: tenant._id,
    interviewId: interview._id,
  });
  const definitions = [
    {
      question: "Kendinizi ve son dönemde üzerinde çalıştığınız bir projeyi anlatır mısınız?",
      duration: 1,
      evaluationCriteria: "İletişim açıklığı, rol ve sorumlulukların somut biçimde ifade edilmesi.",
    },
    {
      question: "Zor bir teknik problemi nasıl analiz edip çözdüğünüzü örnekle açıklayın.",
      duration: 1,
      evaluationCriteria: "Problem çözme yaklaşımı, teknik derinlik ve sonuç odaklılık.",
    },
    {
      question: "Bir ekip içinde fikir ayrılığını nasıl yönettiğinizi anlatır mısınız?",
      duration: 1,
      evaluationCriteria: "İş birliği, empati, iletişim ve çatışma yönetimi.",
    },
  ];
  const questions = definitions.map((definition, index) => ({
    _id: existingQuestions?.questions?.[index]?._id || new mongoose.Types.ObjectId(),
    ...definition,
    audioKey: "",
  }));

  await upsertAndGet(
    interviewQuestions,
    { tenantId: tenant._id, interviewId: interview._id },
    {
      tenantId: tenant._id,
      interviewId: interview._id,
      questions,
      isDeleted: false,
    },
  );

  const answers = await upsertAndGet(
    db.collection("candidateanswers"),
    { userId: user._id, interviewId: interview._id },
    {
      userId: user._id,
      interviewId: interview._id,
      jobApplicationId: application._id,
      jobId: job._id,
      isDeleted: false,
    },
    { interiewAnswers: [] },
  );

  const candidateInterview = await upsertAndGet(
    db.collection("candidateinterviews"),
    { userId: user._id, interviewId: interview._id },
    {
      name: INTERVIEW_NAME,
      userId: user._id,
      jobApplicantId: application._id,
      candidateAnswersId: answers._id,
      candidateId: candidate._id,
      jobId: job._id,
      interviewId: interview._id,
      interviewType: "video",
      totalDuration: definitions.reduce((total, item) => total + item.duration, 0),
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      accessLocked: false,
      mailSent: false,
      isDeleted: false,
    },
    {
      questionIndex: 0,
      status: "pending",
      isStart: false,
      startDate: null,
      isEvaluated: false,
    },
  );

  console.log("Local video interview is assigned.");
  console.log(`Candidate: ${CANDIDATE_EMAIL}`);
  console.log(`Interview ID: ${candidateInterview._id}`);
  console.log(`Open: http://localhost:5174/interviews/${candidateInterview._id}`);
}

assignLocalInterview()
  .catch((error) => {
    console.error("Local interview assignment failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
