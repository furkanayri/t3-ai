import mongoose, { Model, Types } from "mongoose";
import { ICandidateChat, } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateChat { }

interface IModel extends Model<IResource> { }

const modelName = "candidatechat";

const Schema = new BaseSchema({
    interviewId: {
        type: Types.ObjectId,
        ref: "Interview",
        required: true,
    },
    interviewAnswersId: {
        type: Types.ObjectId,
        ref: "interviewAnswers",
        required: true,
    },
    interiewChat: [
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
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource