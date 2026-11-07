import mongoose, { Model, Types } from "mongoose";
import { IInterviewQuestions, } from "../types/entities";//
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IInterviewQuestions { }//

interface IModel extends Model<IResource> { }

const modelName = "interviewquestions";

const Schema = new BaseSchema({
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    interviewId: {
        type: Types.ObjectId,
        ref: "interview",
        required: true,
    },
    questions: [
        {
            question: String,
            duration: Number,
            audioKey: String,
            evaluationCriteria: String,
        }
    ]

})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource