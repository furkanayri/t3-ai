import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";

interface IUserQuizAssignment {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    quizSetId: Types.ObjectId;
    tenantId: Types.ObjectId;
    assignedBy: Types.ObjectId; // Kim atadı
    assignedAt: Date;
    dueDate?: Date; // Son teslim tarihi
    startedAt?: Date;
    completedAt?: Date;
    status: 'assigned' | 'started' | 'completed' | 'overdue' | 'cancelled';
    attempts: number; // Kaç defa denedi
    lastAttemptAt?: Date;
    bestScore?: number;
    bestScorePercentage?: number;
    notes?: string; // Admin notları
    priority: 'low' | 'medium' | 'high';
}

interface IResource extends IUserQuizAssignment { }

interface IModel extends Model<IResource> { }

const modelName = "userquizassignments";

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
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    assignedBy: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: false,
    },
    startedAt: {
        type: Date,
        required: false,
    },
    completedAt: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        enum: ['assigned', 'started', 'completed', 'overdue', 'cancelled'],
        default: 'assigned',
    },
    attempts: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastAttemptAt: {
        type: Date,
        required: false,
    },
    bestScore: {
        type: Number,
        default: 0,
        min: 0,
    },
    bestScorePercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    notes: {
        type: String,
        trim: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    }
}, {
    timestamps: true,
});

// Index'ler
Schema.index({ userId: 1, status: 1 });
Schema.index({ quizSetId: 1, status: 1 });
Schema.index({ tenantId: 1, assignedAt: 1 });
Schema.index({ userId: 1, quizSetId: 1 }, { unique: true }); // Aynı quiz set'i bir kullanıcıya sadece bir kez atanabilir
Schema.index({ dueDate: 1, status: 1 });

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
export { IUserQuizAssignment };