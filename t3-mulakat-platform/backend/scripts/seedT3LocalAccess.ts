import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { PERMISSION_GROUPS } from "@/constants";
import { assertLocalMongoUri, LOCAL_DATABASE } from "./t3BackupUtils";

const ADMIN_EMAIL = "admin@heplin.local";
const TENANT_SUBDOMAIN = "t3-vakfi";

async function upsertAndGet(collection: any, filter: any, values: any) {
  const now = new Date();
  await collection.updateOne(
    filter,
    { $set: { ...values, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
  const result = await collection.findOne(filter);
  if (!result) throw new Error(`Upsert failed for ${collection.collectionName}`);
  return result;
}

async function seed() {
  const mongoUri = assertLocalMongoUri();
  await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB_NAME || LOCAL_DATABASE });
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection was not initialized");

  const tenant = await db.collection("tenants").findOne({ subdomain: TENANT_SUBDOMAIN, isDeleted: { $ne: true } });
  if (!tenant) throw new Error(`Tenant ${TENANT_SUBDOMAIN} was not found in the restored backup`);

  const password = process.env.LOCAL_SEED_PASSWORD || "Local123!";
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await upsertAndGet(db.collection("users"), { email: ADMIN_EMAIL }, {
    email: ADMIN_EMAIL,
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

  await upsertAndGet(db.collection("tenantmembers"), { userId: admin._id, tenantId: tenant._id }, {
    userId: admin._id,
    tenantId: tenant._id,
    status: "active",
    isDeleted: false,
  });

  await upsertAndGet(db.collection("employees"), { userId: admin._id, tenantId: tenant._id }, {
    userId: admin._id,
    tenantId: tenant._id,
    name: "Local",
    surname: "Admin",
    email: ADMIN_EMAIL,
    type: "owner",
    isOnboardCompleted: true,
    isDeleted: false,
  });

  const scopes = [...new Set(Object.values(PERMISSION_GROUPS).flat())];
  for (const scope of scopes) {
    await upsertAndGet(db.collection("permissions"), { userId: admin._id, scope }, {
      userId: admin._id,
      scope,
      resource: { tenantId: [tenant._id.toString()] },
      allowed: true,
      isDeleted: false,
    });
  }

  const origins = ["http://localhost:5173", "http://127.0.0.1:5173"];
  const redirectUrls = [
    "http://localhost:5173/callback",
    "http://localhost:5173/hesap/callback",
    "http://localhost:5173/admin/callback",
    "http://127.0.0.1:5173/callback",
    "http://127.0.0.1:5173/hesap/callback",
    "http://127.0.0.1:5173/admin/callback",
  ];
  await db.collection("configs").updateOne(
    { key: "corsOrigins" },
    { $addToSet: { value: { $each: origins } }, $set: { isDeleted: false } },
    { upsert: true },
  );
  await db.collection("configs").updateOne(
    { key: "validRedirectUrls" },
    { $addToSet: { value: { $each: redirectUrls } }, $set: { isDeleted: false } },
    { upsert: true },
  );

  console.log("T3 local access is ready.");
  console.log(`Tenant: ${tenant.name} (${TENANT_SUBDOMAIN})`);
  console.log(`Admin: ${ADMIN_EMAIL}`);
  console.log(`Company: http://localhost:5173/${TENANT_SUBDOMAIN}`);
}

seed()
  .catch((error) => {
    console.error(`T3 local access seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
