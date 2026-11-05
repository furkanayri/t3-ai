import mongoose, { Model, Schema as MongooseSchema, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";
import { IOnboardingResponse } from "../types/entities";

interface IResource extends IOnboardingResponse { }

interface IModel extends Model<IResource> { }

const modelName = "onboardingresponses";

const Schema = new BaseSchema({
    items: [
        {
            itemId: {
                type: Types.ObjectId,
                required: true
            },
            type: {
                type: String,
                required: true,
                enum: ["text", "file",]
            },
            title: { type: String, required: true },
            response: {
                type: MongooseSchema.Types.Mixed
            },
        }
    ],
    onboardingWorkflowId: {
        type: Types.ObjectId,
        ref: "onboardingworkflows",
        required: true,
    },
    employeeId: {
        type: Types.ObjectId,
        ref: "employees",
        required: true
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending"
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource