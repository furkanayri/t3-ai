import mongoose, { Model, Types } from "mongoose";
import { IAssessmentStage } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IAssessmentStage { }

interface IModel extends Model<IResource> { }

const modelName = "assessmentstages";

const Schema = new BaseSchema({
    assessmentProcessId: {
        type: Types.ObjectId,
        ref: "assessmentprocesses",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    type: {
        type: String,
        enum: ['personality_test', 'text_interview', 'video_interview', 'quiz'],
        required: true,
    },
    // text_interview / video_interview -> interview id, quiz -> quizset id, personality_test -> yok
    refId: {
        type: Types.ObjectId,
        default: null,
    },
    title: {
        type: String,
    },
    required: {
        type: Boolean,
        default: true,
    },
    deadlineDays: {
        type: Number,
        default: 7,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource
