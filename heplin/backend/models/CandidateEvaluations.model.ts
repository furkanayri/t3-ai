import mongoose, { Model, Types } from "mongoose";
import { ICandidateEvaluation } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateEvaluation { }

interface IModel extends Model<IResource> { }

const modelName = "candidateEvaluations";

const ScoreType = {
    type: String,
    enum: ["no", "not-sure", "yes", "strong-yes"]
}

const Schema = new BaseSchema({
    candidateId: {
        type: Types.ObjectId,
        ref: "candidates",
        required: true,
    },
    employeeId: {
        type: Types.ObjectId,
        ref: "employees",
        required: true
    },
    jobId: {
        type: Types.ObjectId,
        ref: "jobs"
    },
    recruitmentStepId: {
        type: Types.ObjectId,
        ref: "recruitmentStageSteps"
    },
    note: String,
    evaluationTemplateId: {
        type: Types.ObjectId,
        ref: "evaluationTemplates"
    },
    score: Number,
    scoreCard: [
        {
            itemId: {
                type: Types.ObjectId,
                required: true
            },
            score: ScoreType
        }
    ],
    fields: [
        {
            fieldId: {
                type: Types.ObjectId,
                required: true
            },
            answer: {
                type: String
            }
        }
    ],
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource