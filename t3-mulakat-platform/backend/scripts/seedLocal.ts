import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { PERMISSION_GROUPS } from "@/constants";

const ADMIN_EMAIL = "admin@heplin.local";
const CANDIDATE_EMAIL = "candidate@heplin.local";
const TENANT_SUBDOMAIN = "demo";

async function upsertAndGet(
  collection: any,
  filter: Record<string, any>,
  values: Record<string, any>,
) {
  const now = new Date();

  await collection.updateOne(
    filter,
    {
      $set: { ...values, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  const document = await collection.findOne(filter);
  if (!document) {
    throw new Error(`Seed upsert failed for ${collection.collectionName}`);
  }

  return document;
}

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || "heplin-local";
  const seedPassword = process.env.LOCAL_SEED_PASSWORD || "Local123!";

  if (!mongoUri) {
    throw new Error("MONGO_URI is required for the local seed");
  }

  if (!/localhost|127\.0\.0\.1/.test(mongoUri)) {
    throw new Error("seed:local only accepts a localhost MongoDB URI");
  }

  await mongoose.connect(mongoUri, { dbName });
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection was not initialized");
  }

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const users = db.collection("users");
  const tenants = db.collection("tenants");
  const tenantMembers = db.collection("tenantmembers");
  const permissions = db.collection("permissions");
  const configs = db.collection("configs");
  const employees = db.collection("employees");
  const categories = db.collection("categories");
  const stages = db.collection("recruitmentstages");
  const stageSteps = db.collection("recruitmentstagesteps");
  const postingChannels = db.collection("postingchannels");
  const candidates = db.collection("candidates");
  const cvs = db.collection("cvs");
  const jobs = db.collection("jobs");
  const jobApplications = db.collection("jobapplications");

  const corsOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
  const redirectUrls = [
    "http://localhost:5173/callback",
    "http://localhost:5173/hesap/callback",
    "http://localhost:5173/admin/callback",
    "http://127.0.0.1:5173/callback",
    "http://127.0.0.1:5173/hesap/callback",
    "http://127.0.0.1:5173/admin/callback",
  ];

  await upsertAndGet(configs, { key: "corsOrigins" }, {
    key: "corsOrigins",
    value: corsOrigins,
    isDeleted: false,
  });
  await upsertAndGet(configs, { key: "validRedirectUrls" }, {
    key: "validRedirectUrls",
    value: redirectUrls,
    isDeleted: false,
  });

  const tenant = await upsertAndGet(tenants, { subdomain: TENANT_SUBDOMAIN }, {
    name: "T3 Vakfı Mülakat Sistemi Local Demo",
    legalName: "T3 Vakfı Mülakat Sistemi Local Demo Ltd.",
    email: "demo@heplin.local",
    phone: "+90 555 000 00 00",
    website: "http://localhost:5173",
    address: "Local Development",
    subdomain: TENANT_SUBDOMAIN,
    description: "Local development tenant",
    country: "Türkiye",
    city: "İstanbul",
    plan: "pro",
    status: "active",
    companySize: "11-50",
    senderMailAddress: "local@heplin.test",
    isDeleted: false,
  });

  const adminUser = await upsertAndGet(users, { email: ADMIN_EMAIL }, {
    email: ADMIN_EMAIL,
    phone: "+90 555 000 00 01",
    password: passwordHash,
    name: "Local",
    surname: "Admin",
    preferredLanguage: "tr",
    status: "active",
    isAcceptedTOS: true,
    isAcceptedKVKK: true,
    isTenantMember: true,
    registeredAt: new Date(),
    isDeleted: false,
  });

  const candidateUser = await upsertAndGet(users, { email: CANDIDATE_EMAIL }, {
    email: CANDIDATE_EMAIL,
    phone: "+90 555 000 00 02",
    password: passwordHash,
    name: "Demo",
    surname: "Candidate",
    preferredLanguage: "tr",
    status: "active",
    isAcceptedTOS: true,
    isAcceptedKVKK: true,
    isTenantMember: true,
    registeredAt: new Date(),
    isDeleted: false,
  });

  for (const userId of [adminUser._id, candidateUser._id]) {
    await upsertAndGet(tenantMembers, { userId, tenantId: tenant._id }, {
      userId,
      tenantId: tenant._id,
      status: "active",
      isDeleted: false,
    });
  }

  const allScopes = [...new Set(Object.values(PERMISSION_GROUPS).flat())];
  for (const scope of allScopes) {
    await upsertAndGet(permissions, { userId: adminUser._id, scope }, {
      userId: adminUser._id,
      scope,
      resource: { tenantId: [tenant._id.toString()] },
      allowed: true,
      isDeleted: false,
    });
  }

  const employee = await upsertAndGet(employees, {
    userId: adminUser._id,
    tenantId: tenant._id,
  }, {
    name: "Local",
    surname: "Admin",
    email: ADMIN_EMAIL,
    phone: "+90 555 000 00 01",
    userId: adminUser._id,
    tenantId: tenant._id,
    type: "owner",
    isOnboardCompleted: true,
    isDeleted: false,
  });

  const category = await upsertAndGet(categories, {
    tenantId: tenant._id,
    name: "Yazılım Geliştirme",
  }, {
    tenantId: tenant._id,
    name: "Yazılım Geliştirme",
    description: "Local demo category",
    status: "active",
    isDeleted: false,
  });

  const stage = await upsertAndGet(stages, {
    tenantId: tenant._id,
    title: "Default",
  }, {
    tenantId: tenant._id,
    title: "Default",
    description: "Local demo recruitment flow",
    isDefault: true,
    isActive: true,
    isDeleted: false,
  });

  const stepDefinitions = [
    ["Başvuru", "Grey"],
    ["Ön Eleme", "Bisque"],
    ["Teknik Mülakat", "LightCoral"],
    ["Teklif", "PaleVioletRed"],
  ];
  const steps = [];

  for (const [title, color] of stepDefinitions) {
    const step = await upsertAndGet(stageSteps, {
      tenantId: tenant._id,
      recruitmentStageId: stage._id,
      title,
    }, {
      tenantId: tenant._id,
      recruitmentStageId: stage._id,
      title,
      description: `${title} aşaması`,
      color,
      isDeleted: false,
    });
    steps.push(step);
  }

  await stages.updateOne(
    { _id: stage._id },
    { $set: { stepsSort: steps.map((step) => step._id), updatedAt: new Date() } },
  );

  const postingChannel = await upsertAndGet(postingChannels, {
    tenantId: tenant._id,
    subdomain: TENANT_SUBDOMAIN,
  }, {
    name: "T3 Vakfı Mülakat Sistemi Local Demo - Job Portal",
    tenantId: tenant._id,
    domain: "localhost",
    subdomain: TENANT_SUBDOMAIN,
    type: "jobportalpage",
    status: "active",
    isOwner: true,
    isDeleted: false,
  });

  const candidate = await upsertAndGet(candidates, {
    userId: candidateUser._id,
    tenantId: tenant._id,
  }, {
    userId: candidateUser._id,
    tenantId: tenant._id,
    name: "Demo",
    surname: "Candidate",
    email: CANDIDATE_EMAIL,
    skills: [],
    languageSkills: [{ langCode: "tr", level: "native" }],
    isDeleted: false,
  });

  const cv = await upsertAndGet(cvs, {
    userId: candidateUser._id,
    fileKey: "sample.pdf",
  }, {
    title: "Demo CV",
    fileName: "sample.pdf",
    fileKey: "sample.pdf",
    uploadedBy: candidateUser._id,
    userId: candidateUser._id,
    isVisible: true,
    size: 0,
    contentType: "application/pdf",
    isDeleted: false,
  });

  const job = await upsertAndGet(jobs, {
    tenantId: tenant._id,
    slug: "senior-typescript-developer-local",
  }, {
    title: "Senior TypeScript Developer",
    slug: "senior-typescript-developer-local",
    content: "T3 Vakfı Mülakat Sistemi local geliştirme ortamı için örnek iş ilanı.",
    createdBy: adminUser._id,
    seoTitle: "Senior TypeScript Developer - Local Demo",
    seoDescription: "T3 Vakfı Mülakat Sistemi local demo job posting",
    tenantId: tenant._id,
    categoryId: category._id,
    hiringTeams: [employee._id],
    jobType: "fulltime",
    locationType: "remote",
    country: { names: { en: "Türkiye", tr: "Türkiye" } },
    city: "İstanbul",
    recruitmentStageId: stage._id,
    applicantForm: [],
    skills: [],
    fields: [
      { type: "name_surname", isRequired: true, isVisible: true },
      { type: "email", isRequired: true, isVisible: true },
      { type: "cv", isRequired: true, isVisible: true },
    ],
    status: "active",
    viewNumber: 1,
    applicationNumber: 1,
    publishedChannels: [{
      channelId: postingChannel._id,
      status: "published",
      lastPublishedAt: new Date(),
    }],
    aiContent: "no",
    isDeleted: false,
  });

  await upsertAndGet(jobApplications, {
    candidateId: candidate._id,
    jobId: job._id,
  }, {
    candidateId: candidate._id,
    userId: candidateUser._id,
    employeeId: employee._id,
    cv: cv._id,
    coverLetter: "Local demo application",
    currentRecruitmentStepId: steps[0]._id,
    applicantAnswers: [],
    matchingScore: 85,
    jobId: job._id,
    tenantId: tenant._id,
    name: "Demo",
    surname: "Candidate",
    status: "applied",
    candidateScore: 8,
    isAppliedViaWhatsapp: false,
    isAppliedViaTelegram: false,
    isDeleted: false,
  });

  console.log("Local demo data is ready.");
  console.log(`Company/Admin: ${ADMIN_EMAIL}`);
  console.log(`Candidate: ${CANDIDATE_EMAIL}`);
  console.log("Password: value of LOCAL_SEED_PASSWORD (default: Local123!)");
}

seed()
  .catch((error) => {
    console.error("Local seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
