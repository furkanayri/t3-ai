import mongoose, { Model, Types } from "mongoose";
import { ICandidateInterview } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateInterview { }

interface IModel extends Model<IResource> { }

const modelName = "candidateInterview";

const Schema = new BaseSchema({
    name: {
        type: String,
    },
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    jobApplicantId: {
        type: Types.ObjectId,
        ref: "jobApplications",
        required: false,
    },
    candidateAnswersId: {
        type: Types.ObjectId,
        ref: "candidateAnswers",
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
        required: false,
    },
    interviewId: {
        type: Types.ObjectId,
        ref: "Interview",
        required: true,
    },
    questionIndex: {
        type: Number,
        default: 0
    },
    interviewType: {
        type: String,
        enum: ['video', 'text']
    },

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
        evaluation: {
            tr: [
                {
                    evaluation: {
                        type: String,
                    },
                    score: {
                        type: Number,
                    },
                    questionId: {
                        type: String,
                    }
                }
            ],
            en: [
                {
                    evaluation: {
                        type: String,
                    },
                    score: {
                        type: Number,
                    },
                    questionId: {
                        type: String,
                    }

                }
            ],
        },
        generalEvaluation: {
            tr: {
                type: String,
            },
            en: {
                type: String,
            }
        },
        totalScore: {
            type: Number
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
    evaluationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
    },
    totalDuration: {
        type: Number
    },
    isEvaluated: {
        type: Boolean,
        default: false,
    },

})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource