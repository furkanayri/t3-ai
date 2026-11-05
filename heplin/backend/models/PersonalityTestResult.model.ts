import mongoose, { Model } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";
import { IPersonalityTestResult } from "@/types/entities";



interface IResource extends IPersonalityTestResult { }

interface IModel extends Model<IResource> { }

const modelName = "personalityTestResult";

const Schema = new BaseSchema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    perfectionism: {
        type: Number,
        required: true,
    },
    ambition: {
        type: Number,
        required: true,
    },
    motivation: {
        type: Number,
        required: true,
    },
    desireForLeadership: {
        type: Number,
        required: true,
    },
    strengths: {
        tr: {
            type: [String],
            default: [],
        },
        en: {
            type: [String],
            default: [],
        },
    },
    weaknesses: {
        tr: {
            type: [String],
            default: [],
        },
        en: {
            type: [String],
            default: [],
        },
    },
});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource;
