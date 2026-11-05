import mongoose, { Model, Types } from "mongoose";
import { IRecruitmentStage } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IRecruitmentStage { }

interface IModel extends Model<IResource> { }

const modelName = "recruitmentStages";

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
    isDefault: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    stepsSort: [
        {
            type: Types.ObjectId,
            ref: "recruitmentStageSteps",
            required: true,
        },
    ],
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource