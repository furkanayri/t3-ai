import mongoose, { Model, Types } from "mongoose";
import { ITenantMember } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ITenantMember { }

interface IModel extends Model<IResource> { }

const modelName = "tenantMembers";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "inactive", "pending"],
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource
