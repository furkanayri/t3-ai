import mongoose, { Model, Types } from "mongoose";
import { IAssessmentStageProgress } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IAssessmentStageProgress { }

interface IModel extends Model<IResource> { }

const modelName = "assessmentstageprogresses";

const Schema = new BaseSchema({
    assignmentId: {
        type: Types.ObjectId,
        ref: "assessmentassignments",
        required: true,
    },
    stageId: {
        type: Types.ObjectId,
        ref: "assessmentstages",
        required: true,
    },
    userId: {
        type: Types.ObjectId,
        ref: "users",
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
    // Asama baslatildiginda olusturulan somut kaydin id'si
    // (candidateInterview / personalityTestSession / userQuizAssignment)
    refInstanceId: {
        type: Types.ObjectId,
        default: null,
    },
    startedAt: {
        type: Date,
        default: null,
    },
})

Schema.index({ assignmentId: 1, stageId: 1 }, { unique: true });

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource
