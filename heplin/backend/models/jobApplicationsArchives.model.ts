import mongoose, { Model, Types, SchemaTypes } from "mongoose";
import { IJobApplicationsArchives } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IJobApplicationsArchives { }

interface IModel extends Model<IResource> { }

const modelName = "jobApplicationsArchives";

const Schema = new BaseSchema({
    candidateId: {
        type: Types.ObjectId,
        ref: "candidateArchives",
        required: false,
    },
    viewedBy: [
        {
            employeeId: {
                type: Types.ObjectId,
                ref: 'employees',
                required: false,
            },
            star: {
                type: Boolean,
                default: false,
            },
            isSeen: {
                type: Boolean,
                default: false,
            },
        }
    ],
    employeeId: {
        type: Types.ObjectId,
        ref: "employees",
    },
    cv: {
        type: Types.ObjectId,
        ref: "cv",
        required: false,
    },
    coverLetter: {
        type: String,
    },
    currentRecruitmentStepId: {
        type: Types.ObjectId,
        ref: "recruitmentStageSteps",
        required: false,
    },
    applicantAnswers: [
        {
            questionId: {
                type: Types.ObjectId,
                // required: true,
            },
            answer: {
                type: SchemaTypes.Mixed,
            },
            isMatching: {
                type: Boolean,
            },
        },
    ],
    matchingScore: {
        type: Number,
        default: 0,
    },
    jobId: {
        type: Types.ObjectId,
        ref: "archiveJobs",
        required: false,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: false,
    },
    disqualifyReason: {
        type: String,
    },
    disqualifyTimestamp: {
        type: Date,
    },
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    status: {
        type: String,
        enum: [
            "applied",
            "onBoarding",
            "hired",
            "cancelledByCandidate",
            "disqualified",
        ],
        default: "applied"
    },
    isAppliedViaWhatsapp: {
        type: Boolean,
        default: false
    },
    candidateScore: {
        type: Number,
        default: 0,
    },
    isAppliedViaTelegram: {
        type: Boolean,
        default: false
    },
});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;