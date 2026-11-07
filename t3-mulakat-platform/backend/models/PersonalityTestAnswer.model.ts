import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";

interface IPersonalityTestAnswer {
    _id?: Types.ObjectId;
    sessionId: Types.ObjectId;
    userId: Types.ObjectId;
    tenantId: Types.ObjectId;
    questionId: number; // 1-64 arası statik soru ID'si
    score: number; // 1-10 arası puan (kullanıcının verdiği)
    calculatedScore: number; // Hesaplanmış puan (reverse scoring uygulanmış)
    subDimension: string; // İnovatif, Analitik, vb.
    scoreType: 'Doğrusal Puan' | 'Reverse Puan';
    answeredAt: Date;
}

interface IResource extends IPersonalityTestAnswer { }

interface IModel extends Model<IResource> { }

const modelName = "personalitytestanswers";

const Schema = new BaseSchema({
    sessionId: {
        type: Types.ObjectId,
        ref: "personalitytestsessions",
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
        // required: true,
    },
    questionId: {
        type: Number,
        required: true,
        min: 1,
        max: 64,
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
    calculatedScore: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
    subDimension: {
        type: String,
        required: true,
    },
    scoreType: {
        type: String,
        enum: ['Doğrusal Puan', 'Reverse Puan'],
        required: true,
    },
    answeredAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// Index'ler
Schema.index({ sessionId: 1, questionId: 1 }, { unique: true });
Schema.index({ sessionId: 1 });
Schema.index({ userId: 1 });
Schema.index({ subDimension: 1 });

const PersonalityTestAnswer = mongoose.model<IResource, IModel>(modelName, Schema);

export default PersonalityTestAnswer;
export type { IPersonalityTestAnswer };
