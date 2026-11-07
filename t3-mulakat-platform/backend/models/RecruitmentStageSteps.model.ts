import mongoose, { Model, Types } from "mongoose";
import { IRecruitmentStageStep } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IRecruitmentStageStep { }

interface IModel extends Model<IResource> { }

const modelName = "recruitmentStageSteps";

const Schema = new BaseSchema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    color: {
        type: String,
        default: "grey",
    },
    recruitmentStageId: {
        type: Types.ObjectId,
        ref: "recruitmentStages",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource