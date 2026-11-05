import mongoose, { Model, Types } from "mongoose";
import { IEvaluationTemplate } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IEvaluationTemplate { }

interface IModel extends Model<IResource> { }

const modelName = "evaluationTemplates";

const Schema = new BaseSchema({
    title: {
        type: String,
        required: true
    },
    scoreCards: [
        {
            title: {
                type: String,
                required: true
            },
            description: String
        }
    ],
    fields: [
        {
            title: {
                type: String,
                required: true
            },
            description: String,
            type: {
                type: String,
                enum: ["multiline"],
                default: "multiline"
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource