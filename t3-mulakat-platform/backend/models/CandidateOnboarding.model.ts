
import mongoose, { Model, Schema as MongooseSchema, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";
import { ICandidateOnboarding } from "@/types/entities";

interface IResource extends ICandidateOnboarding { }

interface IModel extends Model<IResource> { }

const modelName = "candidateonboardings";

const Schema = new BaseSchema({
    candidateId: {
        type: Types.ObjectId,
        ref: "candidates",
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
    jobId: {
        type: Types.ObjectId,
        ref: "jobs",
        required: true,
    },
    jobApplicationId: {
        type: Types.ObjectId,
        ref: "jobApplications",
        required: true,
    },
    onboardingWorkflowId: {
        type: Types.ObjectId,
        ref: "onboardingworkflows",
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "completed", 'offerAccepted', "cancelled",'documentsMissing'],
        default: "pending",
    },
    amountAndCurrency: [{
        amount: {
            type: Number,
            required: false
        },
        currency: {
            type: String,
            required: false,
            enum: ["USD", "EUR", "TRY"]
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "reject"],
            default: "pending",
            required: true
        },
        reason: {
            type: String,
            required: false
        }
    }],
    responses: [
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
            description: { type: String },
            response: {
                type: MongooseSchema.Types.Mixed
            },
        }
    ],
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource