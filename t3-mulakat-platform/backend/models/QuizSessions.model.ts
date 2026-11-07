import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";

interface IQuizSession {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    quizSetId: Types.ObjectId;
    assignmentId: Types.ObjectId;
    tenantId: Types.ObjectId;
    sessionId: string;
    attemptNumber: number;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    totalPoints: number;
    maxPossiblePoints: number;
    scorePercentage: number;
    totalTimeSpent: number; // saniye cinsinden
    timeLimit?: number; // saniye cinsinden
    status: 'active' | 'completed' | 'abandoned' | 'timeout';
    startedAt: Date;
    completedAt?: Date;
    isPassed?: boolean;
}

interface IResource extends IQuizSession { }

interface IModel extends Model<IResource> { }

const modelName = "quizsessions";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    quizSetId: {
        type: Types.ObjectId,
        ref: "quizsets",
        required: true,
    },
    assignmentId: {
        type: Types.ObjectId,
        ref: "userquizassignments",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    attemptNumber: {
        type: Number,
        required: true,
        min: 1,
    },
    totalQuestions: {
        type: Number,
        required: true,
        default: 0,
    },
    answeredQuestions: {
        type: Number,
        required: true,
        default: 0,
    },
    correctAnswers: {
        type: Number,
        required: true,
        default: 0,
    },
    totalPoints: {
        type: Number,
        required: true,
        default: 0,
    },
    maxPossiblePoints: {
        type: Number,
        required: true,
        default: 0,
    },
    scorePercentage: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 100,
    },
    totalTimeSpent: {
        type: Number,
        required: true,
        default: 0,
    },
    timeLimit: {
        type: Number, // saniye cinsinden
        required: false,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned', 'timeout'],
        default: 'active',
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
        required: false,
    },
    isPassed: {
        type: Boolean,
        required: false,
    }
}, {
    timestamps: true,
});

// Index'ler
Schema.index({ userId: 1, status: 1 });
Schema.index({ sessionId: 1 }, { unique: true });
Schema.index({ quizSetId: 1, status: 1 });
Schema.index({ assignmentId: 1, attemptNumber: 1 });
Schema.index({ tenantId: 1, completedAt: 1 });

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
export { IQuizSession };