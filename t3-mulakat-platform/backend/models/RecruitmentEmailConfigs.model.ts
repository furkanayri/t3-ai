import mongoose, { Model, Types } from "mongoose";
import { IRecruitmentEmailConfig } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IRecruitmentEmailConfig { }

interface IModel extends Model<IResource> { }

const modelName = "recruitmentEmailConfigs";
//TODO: add template emails as a model ref
const Schema = new BaseSchema({
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    isEmailsActive: {
        type: Boolean,
        default: false,
        required: true,
    },
    emailFlow: {
        type: String,
        enum: ["auto", "manual"],
        default: "manual",
        required: true,
    },
    recruitmentStageId: {
        type: Types.ObjectId,
        ref: "recruitmentStages",
        required: true,
    },
    recruitmentStageStepId: {
        type: Types.ObjectId,
        ref: "recruitmentStageSteps",
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