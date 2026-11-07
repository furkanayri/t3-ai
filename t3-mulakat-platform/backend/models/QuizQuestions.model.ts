import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";

interface IQuizQuestion {
    _id?: Types.ObjectId;
    tenantId: Types.ObjectId;
    categoryId?: Types.ObjectId;
    title: string;
    description?: string;
    question: string;
    options: {
        optionId: string;
        text: string;
        isCorrect: boolean;
    }[];
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number; // saniye cinsinden
    points: number;
    tags?: string[];
    isActive: boolean;
    explanation?: string; // doğru cevap açıklaması
}

interface IResource extends IQuizQuestion { }

interface IModel extends Model<IResource> { }

const modelName = "quizquestions";

const Schema = new BaseSchema({
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    categoryId: {
        type: Types.ObjectId,
        ref: "categories",
        required: false,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    question: {
        type: String,
        required: true,
        trim: true,
    },
    options: [{
        optionId: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
            default: false,
        }
    }],
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    timeLimit: {
        type: Number,
        default: 30, // 30 saniye
    },
    points: {
        type: Number,
        required: true,
        default: 10,
    },
    tags: [{
        type: String,
        trim: true,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    explanation: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true,
});

// Index'ler
Schema.index({ tenantId: 1, isActive: 1 });
Schema.index({ categoryId: 1, isActive: 1 });
Schema.index({ difficulty: 1, isActive: 1 });
Schema.index({ tags: 1, isActive: 1 });

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
export { IQuizQuestion };