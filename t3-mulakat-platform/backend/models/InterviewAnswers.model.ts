import mongoose, { Model, Types } from "mongoose";
import { IInterviewAnswers, } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IInterviewAnswers { }

interface IModel extends Model<IResource> { }

const modelName = "interviewAnswers";

const Schema = new BaseSchema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    jobAppicantId: {
        type: Types.ObjectId,
        ref: "jobApplications",
        required: true,
    },
    candidateId: {
        type: Types.ObjectId,
        ref: "candidates",
        required: true,
    },
    jobId: {
        type: Types.ObjectId,
        ref: "jobs",
        required: true,
    },
    aiInterviewId: {
        type: Types.ObjectId,
        ref: "Interview",
        required: true,
    },
    interiewAnswers: [
        {
            questionId: {
                type: String,
            },
            answer: {
                type: String,

            },
            evaluateAnswer: {
                type: String,
            },
            question: {
                type: String,
            }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired', 'started'],
        default: 'pending'
    },
    accessLocked: {
        type: Boolean,
        default: false,
    },
    mailSent: {
        type: Boolean,
        default: false,
    },
    expirationDate: {
        type: Date,
        default: null,
    },
    interviewEvaluate: {
        tr: {
            type: String,
        },
        en: {
            type: String,
        },
    },
    eventLogs: [
        {
            eventType: {
                type: String,
                enum: ['copy', 'tabChange'],
                required: true,
            },
            questionId: {
                type: String
            },
        },
    ],
    isStart: {
        type: Boolean,
        default: false,
    },
    startDate: {
        type: Date,
        default: null,
    },
    interviewChatId: {
        type: Types.ObjectId,
        ref: "candidatechat",
    },
    evaluationScore: {
        type: Number,
        min: 0,
        max: 10,
        default: null,
    },

})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource