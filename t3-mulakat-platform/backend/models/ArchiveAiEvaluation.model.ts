import mongoose, { Model, Types } from "mongoose";
import type { ArchiveAiPrompt } from "@/types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ArchiveAiPrompt { }

interface IModel extends Model<IResource> { }

const modelName = "ArchiveAiEvaluation";

const Schema = new BaseSchema({
    candidateId: {
        type: Types.ObjectId,
        ref: "candidateArchives",
        required: true,
    },
    jobId: {
        type: Types.ObjectId,
        ref: "archiveJobs",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    jobApplicationId: {
        type: Types.ObjectId,
        ref: "jobApplicationsArchives",
        required: true,
    },
    candidateScore: {
        type: Number,
        required: true,
    },
    candidateStrengths: {
        type: [
            {
                strength: {
                    tr: { type: String, required: true },
                    en: { type: String, required: true },
                },
                description: {
                    tr: { type: String, required: true },
                    en: { type: String, required: true },
                },
            },
        ],
        required: true,
    },
    candidateMissing: {
        type: [
            {
                skill: {
                    tr: { type: String, required: true },
                    en: { type: String, required: true },
                },
                description: {
                    tr: { type: String, required: true },
                    en: { type: String, required: true },
                },
            },
        ],
        required: true,
    },
    summary: {
        tr: { type: String, default: "" },
        en: { type: String, default: "" },
    },
    improvementSuggestions: {
        type: [
            {
                tr: { type: String, required: true },
                en: { type: String, required: true },
            },
        ],
        default: [],
    },
});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
