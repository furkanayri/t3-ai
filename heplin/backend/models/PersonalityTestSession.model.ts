import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";

interface IPersonalityTestSession {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    tenantId: Types.ObjectId;
    status: 'in-progress' | 'completed' | 'expired';
    currentQuestionIndex: number; // 0-63 arası
    totalQuestions: number; // 64
    answeredQuestions: number; // Kaç soru cevaplanmış
    startTime: Date;
    endTime?: Date;
    expiresAt: Date; // startTime + 15 dakika
    timeRemaining?: number; // Kalan süre (saniye)
}

interface IResource extends IPersonalityTestSession { }

interface IModel extends Model<IResource> { }

const modelName = "personalitytestsessions";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        // required: true,
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'expired'],
        default: 'in-progress',
        required: true,
    },
    currentQuestionIndex: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 63, // 0-63 arası (64 soru için)
    },
    totalQuestions: {
        type: Number,
        required: true,
        default: 64,
    },
    answeredQuestions: {
        type: Number,
        required: true,
        default: 0,
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endTime: {
        type: Date,
        required: false,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    timeRemaining: {
        type: Number,
        required: false,
    },
});

// Index'ler
Schema.index({ userId: 1, tenantId: 1 });
Schema.index({ userId: 1, status: 1 });
Schema.index({ status: 1 });
Schema.index({ expiresAt: 1 });

// Her kullanıcı için sadece bir aktif session olabilir
Schema.index({ userId: 1, tenantId: 1, status: 1 }, { unique: false });

const PersonalityTestSession = mongoose.model<IResource, IModel>(modelName, Schema);

export default PersonalityTestSession;
export type { IPersonalityTestSession };
