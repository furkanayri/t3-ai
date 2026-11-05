import { IPostingChannel, ITenant } from "@/types/entities";
import slugify from "@/utils/slugify";
import bcrypt from "bcryptjs";
import {
  assignAllPermissionsToUser,
  countTenantMembers,
} from "./members/utils/membersUtils";

export default async function createCompanyTenant(ctx: Context) {
  const {
    name,
    legalName,
    email,
    phone,
    website,
    address,
    customDomain,
    logo,
    description,
    parentTenantId,
    country,
    city,
    contacts,
    plan,
    status,
    companySize,
    usageQuotes,
    senderMailAddress,

    hasCareerPage,
    userName,
    userSurname,
    password,
    isAcceptedTOS,
    isAcceptedKVKK,
  } = ctx.request.body;
  const subdomain = slugify(name);

  let payload: Partial<ITenant> = {
    name,
    legalName,
    email,
    phone,
    website,
    address,
    subdomain,
    customDomain,
    logo,
    description,
    parentTenantId,
    country,
    city,
    contacts,
    plan,
    status,
    companySize,
    usageQuotes,
    senderMailAddress,
  };
  const hashedPassword = await bcrypt.hash(password, 12);
  const createUser = await ctx.service("users").create({
    email,
    name: userName,
    surname: userSurname,
    password: hashedPassword,
    isAcceptedTOS,
    isAcceptedKVKK,
    status: "active",
  });

  const tenant = await ctx.service("tenants").create(payload);

  const tenantMember = await ctx.service("tenantMembers").create({
    status: "active",
    tenantId: tenant?._id,
    userId: createUser?._id,
  });

  const jobPortal = await ctx.service("postingChannels").create({
    name: `${tenant?.name} - Job Portal Channel`,
    tenantId: tenant?._id,
    domain: website,
    subdomain: subdomain,
    type: "jobportalpage",
    status: "active",
    isOwner: true,
  });
  // default eklenmesi gereken ilk kurulum için
  //category
  const category = await categoryCreate(tenant, ctx);
  const recruitmentStageId = await recruitmentStages(tenant, ctx);
  const employee = await ctx.service("employees").create({
    name: userName,
    surname: userSurname,
    email,
    phone,
    userId: createUser?._id,
    tenantId: tenant?._id,
    type: "owner",
  })
  if (hasCareerPage) {
    const careerPagePayload: Partial<IPostingChannel> = {
      name: `${tenant?.name} - Career Page Channel`,
      tenantId: tenant?._id,
      type: "careerpage",
      status: "active",
      isOwner: true,
      domain: website,
      subdomain: slugify(tenant?.name),
    };
    const careerPageChannel = await ctx
      .service("postingChannels")
      .create(careerPagePayload);
  }

  const memberCount = await countTenantMembers(ctx, ctx.params.tenantId);

  if (memberCount < 2) {
    await assignAllPermissionsToUser(ctx, tenant?._id, createUser?._id, true);
  }

  ctx.body = { tenantMember, createUser, category, recruitmentStageId };
}

async function categoryCreate(tenant, ctx) {
  const defaultCategories = [
    { name: "Geliştirme", status: "active", tenantId: tenant?._id },
    {
      name: "Müşteri Desteği ve Satış (Customer Support and Sales)",
      status: "active",
      tenantId: tenant?._id,
    },
    {
      name: "Kullanıcı Deneyimi ve Tasarımı (User Experience and Design)",
      status: "active",
      tenantId: tenant?._id,
    },
    {
      name: "Ürün Yönetimi (Product Manangament)",
      status: "active",
      tenantId: tenant?._id,
    },
    {
      name: "Veri ve Analitik (Data and Analiytics)",
      status: "active",
      tenantId: tenant?._id,
    },
    {
      name: "Sistem ve Ağ Yönetimi (System and Network Administration)",
      status: "active",
      tenantId: tenant?._id,
    },
    {
      name: "Kalite Güvence ve Test (Quality Assurance and Testing)",
      status: "active",
      tenantId: tenant?._id,
    },
    { name: "Yönetim Managament", status: "active", tenantId: tenant?._id },
  ];
  try {
    await Promise.all(
      defaultCategories.map(async (category) => {
        await ctx.service("categories").create(category);
      })
    );
  } catch (error) {
    console.log("category error", error);
  }
}

export async function recruitmentStages(tenant, ctx) {
  const recruitmentStagesCreate = await ctx
    .service("recruitmentStages")
    .create({
      title: "Default",
      description: "Başvuru aşamaları",
      tenantId: tenant?._id,
      isDefault: true,
      isActive: true,
      stepsSort: [],
    });

  const recruitmentStageStep = [
    {
      recruitmentStageId: recruitmentStagesCreate._id,
      title: "Başvuru",
      description: "Başvuru aşaması",
      tenantId: tenant?._id,
      color: "Grey",
    },
    {
      recruitmentStageId: recruitmentStagesCreate._id,
      title: "Ön Eleme",
      description: "Ön eleme aşaması",
      tenantId: tenant?._id,
      color: "Bisque",
    },
    {
      recruitmentStageId: recruitmentStagesCreate._id,
      title: "Teknik Mülakat",
      description: "Teknik mülakat aşaması",
      tenantId: tenant?._id,
      color: "LightCoral",
    },
    {
      recruitmentStageId: recruitmentStagesCreate._id,
      title: "Teklif",
      description: "Teklif aşaması",
      tenantId: tenant?._id,
      color: "PaleVioletRed",
    },
    {
      recruitmentStageId: recruitmentStagesCreate._id,
      title: "İmza",
      description: "İmza aşaması",
      tenantId: tenant?._id,
      color: "LightPink",
    },
  ];
  await Promise.all(
    recruitmentStageStep.map(async (step) => {
      await ctx.service("recruitmentStageSteps").create(step);
    })
  );
  const stageSteps = await ctx.service("recruitmentStageSteps").findAll({
    recruitmentStageId: recruitmentStagesCreate._id,
  });

  const recruitmentStageUpdate = await ctx
    .service("recruitmentStages")
    .updateOne(
      { _id: recruitmentStagesCreate._id },
      { stepsSort: stageSteps.results.map((step) => step._id) }
    );
}
