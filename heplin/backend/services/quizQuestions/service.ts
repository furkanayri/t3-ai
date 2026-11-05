import { Model, Types } from "mongoose";
import { BaseService } from "@/utils"

export class QuizQuestionsService extends BaseService<any> {
    constructor(Model: Model<any>) {
        super(Model);
    }

    // Kategoriye göre soruları getir
    async getQuestionsByCategory(categoryId: Types.ObjectId, tenantId: Types.ObjectId) {
        return this.findAll({
            categoryId,
            tenantId,
            isActive: true
        });
    }

    // Zorluk seviyesine göre soruları getir
    async getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard', tenantId: Types.ObjectId) {
        return this.findAll({
            difficulty,
            tenantId,
            isActive: true
        });
    }

    // Tag'e göre soruları getir
    async getQuestionsByTag(tag: string, tenantId: Types.ObjectId) {
        return this.findAll({
            tags: { $in: [tag] },
            tenantId,
            isActive: true
        });
    }

    // Rastgele soru seç
    async getRandomQuestions(count: number, tenantId: Types.ObjectId, categoryId?: Types.ObjectId) {
        const filter: any = {
            tenantId,
            isActive: true
        };

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        return this.aggregate([
            { $match: filter },
            { $sample: { size: count } }
        ]);
    }

    // Soru istatistikleri
    async getQuestionStats(tenantId: Types.ObjectId) {
        return this.aggregate([
            { $match: { tenantId, isActive: true } },
            {
                $group: {
                    _id: null,
                    totalQuestions: { $sum: 1 },
                    easyCount: {
                        $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] }
                    },
                    mediumCount: {
                        $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] }
                    },
                    hardCount: {
                        $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] }
                    },
                    totalPoints: { $sum: "$points" },
                    avgPoints: { $avg: "$points" }
                }
            }
        ]);
    }

    // Soru ve şıklarını güncelle
    async updateQuestionWithOptions(questionId: Types.ObjectId, updateData: any) {
        return this.update(questionId, updateData);
    }

    // Soruyu pasif yap (soft delete yerine)
    async deactivateQuestion(questionId: Types.ObjectId) {
        return this.update(questionId, { isActive: false });
    }

    // Soruyu aktif yap
    async activateQuestion(questionId: Types.ObjectId) {
        return this.update(questionId, { isActive: true });
    }
}