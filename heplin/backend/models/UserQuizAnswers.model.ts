import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";

interface IUserQuizAnswer {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    questionId: Types.ObjectId;
    tenantId?: Types.ObjectId;
    sessionId?: Types.ObjectId; // Quiz session referansı
    quizSessionId?: string; // Session string ID (backward compatibility)
    answer: string; // Seçilen option ID (selectedOptionId yerine)
    selectedOptionId?: string; // Backward compatibility
    isCorrect: boolean;
    timeSpent: number; // saniye cinsinden
    points: number; // earnedPoints yerine
    earnedPoints?: number; // Backward compatibility
    answeredAt: Date;
}

interface IResource extends IUserQuizAnswer { }

interface IModel extends Model<IResource> { }

const modelName = "userquizanswers";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    questionId: {
        type: Types.ObjectId,
        ref: "quizquestions",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: false,
    },
    sessionId: {
        type: Types.ObjectId,
        ref: "quizsessions",
        required: false,
    },
    quizSessionId: {
        type: String,
        required: false,
    },
    answer: {
        type: String,
        required: true,
    },
    selectedOptionId: {
        type: String,
        required: false, // Backward compatibility
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    timeSpent: {
        type: Number,
        required: true,
        default: 0,
    },
    points: {
        type: Number,
        required: true,
        default: 0,
    },
    earnedPoints: {
        type: Number,
        required: false, // Backward compatibility
        default: 0,
    },
    answeredAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

// Index'ler
Schema.index({ userId: 1, sessionId: 1 });
Schema.index({ sessionId: 1, questionId: 1 });
Schema.index({ userId: 1, quizSessionId: 1 }); // Backward compatibility
Schema.index({ tenantId: 1, answeredAt: 1 });
Schema.index({ questionId: 1, isCorrect: 1 });

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
export { IUserQuizAnswer };