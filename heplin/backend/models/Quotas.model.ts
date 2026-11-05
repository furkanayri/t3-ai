import mongoose, { Model, Types } from "mongoose";
import { IQuotas } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IQuotas { }

interface IModel extends Model<IResource> { }

const modelName = "quotas";

const Schema = new BaseSchema({
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants"
    },
    // subscriptionId: {
    //     type: Types.ObjectId,
    //     ref: "subscriptions"
    // },{}
    email: {
        credit: { type: Number, required: true },
        remainingCredit: { type: Number, required: true }
    },
    job: {
        credit: { type: Number, required: true },
        remainingCredit: { type: Number, required: true }
    },
    jobApplications: [
        {
            jobId: { type: Types.ObjectId, ref: "jobs", required: true },
            totalLimit: { type: Number, required: true, default: 100 }, // Maksimum başvuru
            remainingApplications: { type: Number, required: true, default: 100 } // Kalan başvuru
        }
    ],
    aiFeatures: {
        interview: {
            isActive: { type: Boolean, default: false },
            maxAllowed: { type: Number, required: true },
            remainingCount: { type: Number, required: true }
        },
        videoInterview: {
            isActive: { type: Boolean, default: false },
            maxAllowed: { type: Number, required: true },
            remainingCount: { type: Number, required: true }
        },
        evaluation: {
            isActive: { type: Boolean, default: false },
            maxAllowed: { type: Number, required: true },
            remainingCount: { type: Number, required: true }
        }
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource