import mongoose, { Model, Types } from "mongoose";
import { ITenantUsageQuoteLogs } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ITenantUsageQuoteLogs { }

interface IModel extends Model<IResource> { }

const modelName = "tenantUsageQuoteLogs";

const Schema = new BaseSchema({
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true
    },
    credit: {
        type: Number,
        default: 1
    },
    type: {
        type: String,
        enum: ["sms", "email"]
    },
    message: {
        type: String,
    },
    taskType: {
        type: String,
        //TODO: Add enum
    },
    sender: {
        type: String,
    },
    recipient: {
        type: String
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource