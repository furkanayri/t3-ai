import mongoose, { Model, Types } from "mongoose";
import { ICandidateAnswers, } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";
import { object } from "joi";

interface IResource extends ICandidateAnswers { }

interface IModel extends Model<IResource> { }

const modelName = "candidateAnswers";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    interviewId: {
        type: Types.ObjectId,
        ref: "Interview",
        required: true,
    },

    jobApplicationId: {
        type: Types.ObjectId,
        ref: "jobApplications",
        required: false,
    },
    jobId: {
        type: Types.ObjectId,
        ref: "jobs",
        required: false,
    },
    interiewAnswers: [
        {
            questionId: {
                type: String,
            },
            responseTime: {
                type: Number,
                default: 0
            },
            answer: {
                type: String,
            },
            fileKey: {
                type: String
            },
            evaluateAnswer: {
                type: String,
            },
            question: {
                type: String,
            },
            transcription: {
                type: Object
            }
        }
    ],
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource