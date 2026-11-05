import { IPostingChannel, ITenant } from "@/types/entities";
import slugify from "@/utils/slugify";
import { Types } from "mongoose";
import { recruitmentStages } from "./createCompanyTenant";
import { PLANS } from "@/constants";

export default async function createOneTenant(ctx: Context) {
  const {
    name,
    legalName,
    description,
    address,
    phone,
    email,
    website,
    logo,
    city,
    country,
    parentTenantId,
    hasCareerPage,
  } = ctx.request.body;

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
    createdBy: ctx.state.user._id,
    parentTenantId: null,
    status: "active",
  };

  if (parentTenantId) {
    const parentTenant = await ctx.service("tenants").findById(parentTenantId);

    if (!parentTenant) ctx.throw(404, "invalid parent tenant id");

    if (!parentTenant._id || (typeof parentTenant._id !== 'string' && !(parentTenant._id instanceof Types.ObjectId)))
      ctx.throw(404, "Invalid parent tenant id");
    payload.parentTenantId = parentTenant._id;
    payload.senderMailAddress = `${subdomain}@heplin.com`;
    const createdTenant = await ctx.service("tenants").create(payload);

    await recruitmentStages(createdTenant, ctx);
    const parentTenantJobsChannel = await ctx
      .service("postingChannels")
      .findOne({
        tenantId: parentTenant._id,
        status: "active",
        type: "jobportalpage",
      });

    const connectionChannelPayload: Partial<IPostingChannel> = {
      name: `${createdTenant?.name} - ${parentTenantJobsChannel.name}`,
      tenantId: createdTenant?._id,
      type: "connection",
      status: "active",
      isOwner: false,
      domain: parentTenant?.website,
      subdomain: parentTenant.subdomain,
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
        status: "active",
        isOwner: true,
        domain: parentTenant?.website,
        subdomain: slugify(createdTenant?.name),
      };
      const careerPageChannel = await ctx
        .service("postingChannels")
        .create(careerPagePayload);

      result.careerPageChannel = careerPageChannel;
    }
    const createQuota = await ctx.service("quotas").create({ ...PLANS.free, tenantId: createdTenant._id })


    ctx.state.createdTenant = createdTenant;
    ctx.body = result;
  } else {
    const existingParentTenant = await ctx.service("tenants").findOne({
      parentTenantId: null,
    });
    if (existingParentTenant) ctx.throw(400, "A parent tenant already exists");
    const response = await ctx.service("tenants").create(payload);

    ctx.body = {
      tenant: response,
    };
  }
}
