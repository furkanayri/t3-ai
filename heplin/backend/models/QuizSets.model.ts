import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";

interface IQuizSet {
    _id?: Types.ObjectId;
    tenantId: Types.ObjectId;
    categoryId?: Types.ObjectId;
    title: string;
    description?: string;
    instructions?: string; // Test talimatları
    questionIds: Types.ObjectId[]; // QuizQuestions'dan referanslar
    totalQuestions: number;
    totalPoints: number;
    timeLimit?: number; // toplam test süresi (dakika)
    passingScore?: number; // geçme puanı
    difficulty: 'easy' | 'medium' | 'hard';
    tags?: string[];
    isActive: boolean;
    shuffleQuestions?: boolean; // soruları karıştır
    shuffleOptions?: boolean; // şıkları karıştır
    allowRetake?: boolean; // tekrar alma izni
    maxAttempts?: number; // maksimum deneme sayısı
    showResults?: 'immediately' | 'after_completion' | 'manual'; // sonuç gösterme
}

interface IResource extends IQuizSet { }

interface IModel extends Model<IResource> { }

const modelName = "quizsets";

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
    instructions: {
        type: String,
        trim: true,
    },
    questionIds: [{
        type: Types.ObjectId,
        ref: "quizquestions",
        required: true,
    }],
    totalQuestions: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPoints: {
        type: Number,
        required: true,
        min: 0,
    },
    timeLimit: {
        type: Number, // dakika cinsinden
        min: 1,
    },
    passingScore: {
        type: Number,
        min: 0,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    shuffleQuestions: {
        type: Boolean,
        default: false,
    },
    shuffleOptions: {
        type: Boolean,
        default: false,
    },
    allowRetake: {
        type: Boolean,
        default: true,
    },
    maxAttempts: {
        type: Number,
        min: 1,
        default: 3,
    },
    showResults: {
        type: String,
        enum: ['immediately', 'after_completion', 'manual'],
        default: 'after_completion',
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
export { IQuizSet };