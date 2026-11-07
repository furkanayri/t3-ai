import { IPostingChannel, ITenant, UserStatus } from "@/types/entities";
import { generateTokenAndSetCookie } from "@/utils";
import slugify from "@/utils/slugify";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import joi from "joi";
import {
  assignAllPermissionsToUser,
  countTenantMembers,
  sendInvitationEmail,
} from "./members/utils/membersUtils";
import { recruitmentStages } from "./createCompanyTenant";
import { PLANS } from "@/constants";

export default async function createTenantForCompany(ctx: Context) {
  const {
    userName,
    userSurname,
    email,
    phone,
    password,
    isAcceptedKVKK,
    isAcceptedTOS,
    legalName,
    description,
    address,
    website,
    logo,
    city,
    country,
    name,
    hasCareerPage,
  } = ctx.request.body;

  //only parent tenant Heplin
  const existingParentTenant = await ctx
    .service("tenants")
    .findOne({ subdomain: "heplin", parentTenantId: null });

  if (!existingParentTenant) ctx.throw(404, "Parent tenant not found");

  const subdomain = slugify(name);
  const isExistTenantBySubdomain = await ctx
    .service("tenants")
    .findOne({ subdomain });
  if (isExistTenantBySubdomain) ctx.throw("Subdomain already exist");


  let payload: Partial<ITenant> = {
    name,
    legalName,
    description,
    address,
    phone,
    email,
    website,
    logo,
    subdomain,
    city,
    country,
    createdBy: ctx.state.user?._id,
    parentTenantId: existingParentTenant?._id as string | Types.ObjectId,
    status: "active",
    senderMailAddress: `${subdomain}@heplin.com`,
  };

  if (payload.parentTenantId) {
    const parentTenant = await ctx
      .service("tenants")
      .findById(payload.parentTenantId?.toString());

    if (!parentTenant) ctx.throw(404, "invalid parent tenant id");

    if (!parentTenant?._id || (typeof parentTenant?._id !== 'string' && !(parentTenant?._id instanceof Types.ObjectId)))
      ctx.throw(404, "Invalid parent tenant id");
    payload.parentTenantId = parentTenant._id;
    const registrationResult = await register(ctx, {
      name: userName,
      surname: userSurname,
      email: email,
      phone: phone,
      password: password,
      isAcceptedKVKK: isAcceptedKVKK,
      isAcceptedTOS: isAcceptedTOS,
    });

    if (registrationResult.error) {
      ctx.throw(400, "user registration failed");
    }
    const createdTenant = await ctx.service("tenants").create(payload);
    await ctx.service("employees").create({
      name: userName,
      surname: userSurname,
      email: email,
      phone: phone,
      userId: registrationResult?.user?._id,
      tenantId: createdTenant?._id,
      type: "owner",
    });

    const createRecruimentStages = await recruitmentStages(createdTenant, ctx);
    console.log("createRecruimentStages", createRecruimentStages);

    const parentTenantJobsChannel = await ctx
      .service("postingChannels")
      .findOne({
        tenantId: parentTenant?._id,
        status: "active",
        type: "jobportalpage",
      });

    const connectionChannelPayload: Partial<IPostingChannel> = {
      name: `${createdTenant?.name} - ${parentTenantJobsChannel.name}`,
      tenantId: createdTenant?._id,
      type: "connection",
      status: "active",
      isOwner: false,
      domain: createdTenant?.website,
      subdomain: createdTenant.subdomain,
      connectionChannelId: new Types.ObjectId(
        parentTenantJobsChannel?._id?.toString()
      ),
    };

    const connectionChannel = await ctx
      .service("postingChannels")
      .create(connectionChannelPayload);

    const result: any = {
      tenant: createdTenant,
      connectionChannel,
    };

    if (hasCareerPage) {
      const careerPagePayload: Partial<IPostingChannel> = {
        name: `${createdTenant?.name} - Career Page Channel`,
        tenantId: createdTenant?._id,
        type: "careerpage",
        status: "inactive",
        isOwner: true,
        domain: parentTenant?.website,
        subdomain: slugify(createdTenant?.name),
      };
      const careerPageChannel = await ctx
        .service("postingChannels")
        .create(careerPagePayload);

      result.careerPageChannel = careerPageChannel;
    }

    await inviteMemberToTenant(ctx, createdTenant._id, email);
    const createQuota = await ctx.service("quotas").create({ ...PLANS.free, tenantId: createdTenant._id })
    result.createQuota = createQuota
    ctx.state.createdTenant = createdTenant._id;//for deteremineColorTenant middleware
    ctx.body = result;
  } else {
    const existingParentTenant = await ctx.service("tenants").findOne({
      parentTenantId: null,
    });
    if (existingParentTenant) ctx.throw(400, "A parent tenant already exists");
    const response = await ctx.service("tenants").create(payload);

    await inviteMemberToTenant(ctx, response._id, email);
    ctx.state.createdTenant = response._id;//for deteremineColorTenant middleware

    ctx.body = {
      tenant: response,
    };
  }
}

//register user
const validation = joi.object({
  name: joi.string().required(),
  surname: joi.string().required(),
  email: joi.string().email().required(),
  phone: joi.string().required(),
  password: joi.string().required(),
  isAcceptedKVKK: joi.boolean().required(),
  isAcceptedTOS: joi.boolean().required(),
});

export async function register(ctx: Context, userData: any) {
  const validatedData = validation.validate(userData);

  if (validatedData.error) {
    return {
      error: validatedData.error.message,
    };
  }

  const {
    name,
    surname,
    email,
    phone,
    password,
    isAcceptedKVKK,
    isAcceptedTOS,
  } = validatedData.value;

  const isExistingUser = await ctx
    .service("users")
    .findOne({ $or: [{ email }, { phone }] });

  if (isExistingUser) {
    ctx.status = 400;
    ctx.body = {
      error: "User already exists",
    };
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 12);

  const userResponse = await ctx.service("users").create({
    name,
    surname,
    email,
    phone,
    status: "active",
    password: hashedPassword,
    isAcceptedKVKK,
    isAcceptedTOS,
  });

  const token = await generateTokenAndSetCookie(
    userResponse?._id?.toString(),
    ctx
  );

  return {
    token,
    user: userResponse,
  };
}

//invite member to tenant
export async function inviteMemberToTenant(ctx: Context, tenantId, email) {
  const user: any = await ctx.service("users").findOne({ email });

  if (!user) {
    ctx.throw(400, "User does not exist");
  }

  if (user.isDeleted) ctx.throw(400, "User is deleted");

  if (
    (["deleted", "frozen", "passive"] as UserStatus[]).includes(user.status)
  ) {
    ctx.throw(400, "User is not active");
  }

  const tenantMember = await ctx.service("tenantMembers").findOne({
    userId: user._id,
    tenantId,
  });

  if (tenantMember && tenantMember?.status === "active") {
    ctx.throw(400, "User is already an active member of this tenant");
  }
  if (tenantMember && tenantMember?.status !== "active") {
    ctx.throw(400, "User is already a member of this tenant, but not active");
  }

  const existingTenantMember = await ctx.service("tenantMembers").findOne({
    userId: user?._id,
  });
  if (existingTenantMember)
    ctx.throw(400, "User is already registered to a tenant");

  if (!user.password && !user.googleId) {
    const { registrationToken, registrationTokenExpires } =
      await sendInvitationEmail({ email });

    user.registrationToken = registrationToken;
    user.registrationTokenExpires = registrationTokenExpires;

    await user.save();

    if (!user?._id || (typeof user._id !== 'string' && !(user._id instanceof Types.ObjectId)))
      ctx.throw(400, "Invalid user id");
    await ctx.service("tenantMembers").create({
      userId: user._id,
      tenantId,
      status: "pending",
    });

    await ctx
      .service("users")
      .updateOne({ _id: user._id }, { isTenantMember: true });

    const memberCount = await countTenantMembers(ctx, tenantId);

    if (memberCount === 1) {
      await assignAllPermissionsToUser(ctx, tenantId, user?._id);
    }

    ctx.body = {
      isSuccess: true,
      isSendRegistrationMail: true,
      email,
      user: user.toObject(),
    };
  } else {
    if (!user?._id || (typeof user._id !== 'string' && !(user._id instanceof Types.ObjectId)))
      ctx.throw(400, "Invalid user id");
    await ctx.service("tenantMembers").create({
      userId: user._id,
      tenantId,
      status: "active",
    });

    await ctx
      .service("users")
      .updateOne({ _id: user._id }, { isTenantMember: true });

    const memberCount = await countTenantMembers(ctx, tenantId);
    if (memberCount === 1) {
      await assignAllPermissionsToUser(ctx, tenantId, user?._id);
    }

    ctx.body = {
      isSuccess: true,
      isSendRegistrationMail: false,
      user: user.toObject(),
    };
  }
}
