import { Model, Types } from "mongoose";
import { BaseService } from "@/utils"

export class QuizSetsService extends BaseService<any> {
    constructor(Model: Model<any>) {
        super(Model);
    }

    // Aktif quiz setlerini getir
    async getActiveQuizSets(tenantId: Types.ObjectId) {
        return this.findAll({
            tenantId,
            isActive: true
        });
    }

    // Kategoriye göre quiz setlerini getir
    async getQuizSetsByCategory(categoryId: Types.ObjectId, tenantId: Types.ObjectId) {
        return this.findAll({
            categoryId,
            tenantId,
            isActive: true
        });
    }

    // Zorluk seviyesine göre quiz setlerini getir
    async getQuizSetsByDifficulty(difficulty: 'easy' | 'medium' | 'hard', tenantId: Types.ObjectId) {
        return this.findAll({
            difficulty,
            tenantId,
            isActive: true
        });
    }

    // Quiz set detayını sorularıyla birlikte getir
    async getQuizSetWithQuestions(quizSetId: Types.ObjectId) {
        return this.aggregate([
            { $match: { _id: quizSetId, isActive: true } },
            {
                $lookup: {
                    from: 'quizquestions',
                    localField: 'questionIds',
                    foreignField: '_id',
                    as: 'questions'
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    instructions: 1,
                    totalQuestions: 1,
                    totalPoints: 1,
                    timeLimit: 1,
                    passingScore: 1,
                    difficulty: 1,
                    shuffleQuestions: 1,
                    shuffleOptions: 1,
                    allowRetake: 1,
                    maxAttempts: 1,
                    showResults: 1,
                    questions: {
                        $map: {
                            input: '$questions',
                            as: 'question',
                            in: {
                                _id: '$$question._id',
                                title: '$$question.title',
                                question: '$$question.question',
                                options: '$$question.options',
                                timeLimit: '$$question.timeLimit',
                                points: '$$question.points',
                                difficulty: '$$question.difficulty'
                            }
                        }
                    }
                }
            }
        ]);
    }

    // Quiz set istatistikleri
    async getQuizSetStats(tenantId: Types.ObjectId) {
        return this.aggregate([
            { $match: { tenantId, isActive: true } },
            {
                $group: {
                    _id: null,
                    totalQuizSets: { $sum: 1 },
                    easyCount: {
                        $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] }
                    },
                    mediumCount: {
                        $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] }
                    },
                    hardCount: {
                        $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] }
                    },
                    totalQuestions: { $sum: "$totalQuestions" },
                    totalPoints: { $sum: "$totalPoints" },
                    avgQuestionsPerSet: { $avg: "$totalQuestions" },
                    avgPointsPerSet: { $avg: "$totalPoints" }
                }
            }
        ]);
    }

    // Quiz set'e soru ekle
    async addQuestionToSet(quizSetId: Types.ObjectId, questionId: Types.ObjectId, questionPoints: number) {
        const quizSet = await this.findById(quizSetId.toString());
        if (!quizSet) throw new Error('Quiz set not found');

        return this.update(quizSetId, {
            $push: { questionIds: questionId },
            $inc: { 
                totalQuestions: 1,
                totalPoints: questionPoints 
            }
        });
    }

    // Quiz set'ten soru çıkar
    async removeQuestionFromSet(quizSetId: Types.ObjectId, questionId: Types.ObjectId, questionPoints: number) {
        return this.update(quizSetId, {
            $pull: { questionIds: questionId },
            $inc: { 
                totalQuestions: -1,
                totalPoints: -questionPoints 
            }
        });
    }

    // Quiz set'i pasif yap
    async deactivateQuizSet(quizSetId: Types.ObjectId) {
        return this.update(quizSetId, { isActive: false });
    }

    // Quiz set'i aktif yap
    async activateQuizSet(quizSetId: Types.ObjectId) {
        return this.update(quizSetId, { isActive: true });
    }

    // Quiz set kopyala
    async duplicateQuizSet(quizSetId: Types.ObjectId, newTitle: string) {
        const originalSet = await this.findById(quizSetId.toString());
        if (!originalSet) throw new Error('Quiz set not found');

        const duplicateData = {
            ...originalSet.toObject(),
            title: newTitle,
            _id: undefined,
            createdAt: undefined,
            updatedAt: undefined
        };

        return this.create(duplicateData);
    }
}