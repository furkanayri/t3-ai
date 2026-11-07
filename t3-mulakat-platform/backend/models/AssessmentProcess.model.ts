import mongoose, { Model, Types } from "mongoose";
import { IAssessmentProcess } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IAssessmentProcess { }

interface IModel extends Model<IResource> { }

const modelName = "assessmentprocesses";

const Schema = new BaseSchema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    sequential: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    stagesSort: [
        {
            type: Types.ObjectId,
            ref: "assessmentstages",
        },
    ],
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource
