import mongoose, { Model, Types } from "mongoose";
import { IPostingChannel } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IPostingChannel { }

interface IModel extends Model<IResource> { }

const modelName = "postingChannels";

const Schema = new BaseSchema({
    name: {
        type: String,
        required: true
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    domain: {
        type: String,
        required: false
    },
    subdomain: {
        type: String,
        required: false
    },
    connectionChannelId: { // previously values.heplinjobsPostingChannelId
        type: Types.ObjectId,
        ref: "postingChannels",
        required: false,
    },
    type: {
        type: String,
        enum: ["careerpage", "jobportalpage", "connection", 'districtgovernorate']
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "inactive", "pending"]
    },
    isOwner: { // If the channel is internal careerpage, then isOwner field equals to true. To publish job posting directly.
        type: Boolean,
        default: false
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource
