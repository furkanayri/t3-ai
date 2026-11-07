import { Model, Types } from "mongoose";
import { BaseService } from "@/utils"

export class UserQuizAnswersService extends BaseService<any> {
    constructor(Model: Model<any>) {
        super(Model);
    }

    // Cevap kaydet
    async saveAnswer(answerData: any) {
        return this.create({
            ...answerData,
            answeredAt: new Date()
        });
    }

    // Oturumdaki tüm cevapları getir
    async getSessionAnswers(quizSessionId: string) {
        return this.aggregate([
            { $match: { quizSessionId } },
            {
                $lookup: {
                    from: 'quizquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },
            {
                $project: {
                    _id: 1,
                    questionId: 1,
                    selectedOptionId: 1,
                    isCorrect: 1,
                    timeSpent: 1,
                    earnedPoints: 1,
                    answeredAt: 1,
                    'question.title': 1,
                    'question.question': 1,
                    'question.options': 1,
                    'question.explanation': 1,
                    'question.points': 1
                }
            },
            { $sort: { answeredAt: 1 } }
        ]);
    }

    // Kullanıcının cevap geçmişi
    async getUserAnswerHistory(userId: Types.ObjectId, limit = 100) {
        return this.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'quizquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            {
                $lookup: {
                    from: 'quizsessions',
                    localField: 'quizSessionId',
                    foreignField: 'sessionId',
                    as: 'session'
                }
            },
            { $unwind: '$question' },
            { $unwind: '$session' },
            {
                $project: {
                    _id: 1,
                    selectedOptionId: 1,
                    isCorrect: 1,
                    timeSpent: 1,
                    earnedPoints: 1,
                    answeredAt: 1,
                    'question.title': 1,
                    'question.difficulty': 1,
                    'session.sessionId': 1
                }
            },
            { $sort: { answeredAt: -1 } },
            { $limit: limit }
        ]);
    }

    // Soru bazında performans analizi
    async getQuestionPerformance(questionId: Types.ObjectId) {
        return this.aggregate([
            { $match: { questionId } },
            {
                $group: {
                    _id: "$selectedOptionId",
                    count: { $sum: 1 },
                    isCorrect: { $first: "$isCorrect" },
                    avgTimeSpent: { $avg: "$timeSpent" }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: "$count" },
                    correctAttempts: {
                        $sum: { $cond: [{ $eq: ["$isCorrect", true] }, "$count", 0] }
                    },
                    optionStats: {
                        $push: {
                            optionId: "$_id",
                            count: "$count",
                            isCorrect: "$isCorrect",
                            avgTimeSpent: "$avgTimeSpent"
                        }
                    },
                    avgTimeSpent: { $avg: "$avgTimeSpent" }
                }
            },
            {
                $project: {
                    totalAttempts: 1,
                    correctAttempts: 1,
                    successRate: {
                        $multiply: [
                            { $divide: ["$correctAttempts", "$totalAttempts"] },
                            100
                        ]
                    },
                    optionStats: 1,
                    avgTimeSpent: 1
                }
            }
        ]);
    }

    // Kullanıcı performans özeti
    async getUserPerformanceSummary(userId: Types.ObjectId) {
        return this.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalAnswers: { $sum: 1 },
                    correctAnswers: {
                        $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] }
                    },
                    totalPoints: { $sum: "$earnedPoints" },
                    avgTimePerQuestion: { $avg: "$timeSpent" },
                    fastestAnswer: { $min: "$timeSpent" },
                    slowestAnswer: { $max: "$timeSpent" }
                }
            },
            {
                $project: {
                    totalAnswers: 1,
                    correctAnswers: 1,
                    successRate: {
                        $multiply: [
                            { $divide: ["$correctAnswers", "$totalAnswers"] },
                            100
                        ]
                    },
                    totalPoints: 1,
                    avgTimePerQuestion: 1,
                    fastestAnswer: 1,
                    slowestAnswer: 1
                }
            }
        ]);
    }

    // Zorluk seviyesi bazında performans
    async getUserDifficultyPerformance(userId: Types.ObjectId) {
        return this.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'quizquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },
            {
                $group: {
                    _id: "$question.difficulty",
                    totalAnswers: { $sum: 1 },
                    correctAnswers: {
                        $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] }
                    },
                    avgTimeSpent: { $avg: "$timeSpent" },
                    totalPoints: { $sum: "$earnedPoints" }
                }
            },
            {
                $project: {
                    difficulty: "$_id",
                    totalAnswers: 1,
                    correctAnswers: 1,
                    successRate: {
                        $multiply: [
                            { $divide: ["$correctAnswers", "$totalAnswers"] },
                            100
                        ]
                    },
                    avgTimeSpent: 1,
                    totalPoints: 1
                }
            },
            { $sort: { difficulty: 1 } }
        ]);
    }

    // Kategori bazında performans
    async getUserCategoryPerformance(userId: Types.ObjectId) {
        return this.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'quizquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'question.categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: "$question.categoryId",
                    categoryName: { $first: "$category.name" },
                    totalAnswers: { $sum: 1 },
                    correctAnswers: {
                        $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] }
                    },
                    avgTimeSpent: { $avg: "$timeSpent" },
                    totalPoints: { $sum: "$earnedPoints" }
                }
            },
            {
                $project: {
                    categoryId: "$_id",
                    categoryName: 1,
                    totalAnswers: 1,
                    correctAnswers: 1,
                    successRate: {
                        $multiply: [
                            { $divide: ["$correctAnswers", "$totalAnswers"] },
                            100
                        ]
                    },
                    avgTimeSpent: 1,
                    totalPoints: 1
                }
            },
            { $sort: { successRate: -1 } }
        ]);
    }

    // En çok yanlış yapılan sorular
    async getMostMissedQuestions(tenantId: Types.ObjectId, limit = 10) {
        return this.aggregate([
            { $match: { tenantId } },
            {
                $group: {
                    _id: "$questionId",
                    totalAttempts: { $sum: 1 },
                    wrongAttempts: {
                        $sum: { $cond: [{ $eq: ["$isCorrect", false] }, 1, 0] }
                    }
                }
            },
            {
                $match: { wrongAttempts: { $gt: 0 } }
            },
            {
                $project: {
                    questionId: "$_id",
                    totalAttempts: 1,
                    wrongAttempts: 1,
                    errorRate: {
                        $multiply: [
                            { $divide: ["$wrongAttempts", "$totalAttempts"] },
                            100
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'quizquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },
            {
                $project: {
                    questionId: 1,
                    totalAttempts: 1,
                    wrongAttempts: 1,
                    errorRate: 1,
                    'question.title': 1,
                    'question.difficulty': 1
                }
            },
            { $sort: { errorRate: -1 } },
            { $limit: limit }
        ]);
    }

    // Günlük/haftalık istatistikler
    async getAnswerStats(tenantId: Types.ObjectId, dateFrom: Date, dateTo: Date) {
        return this.aggregate([
            {
                $match: {
                    tenantId,
                    answeredAt: {
                        $gte: dateFrom,
                        $lte: dateTo
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$answeredAt"
                        }
                    },
                    totalAnswers: { $sum: 1 },
                    correctAnswers: {
                        $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] }
                    },
                    avgTimeSpent: { $avg: "$timeSpent" },
                    totalPoints: { $sum: "$earnedPoints" }
                }
            },
            {
                $project: {
                    date: "$_id",
                    totalAnswers: 1,
                    correctAnswers: 1,
                    successRate: {
                        $multiply: [
                            { $divide: ["$correctAnswers", "$totalAnswers"] },
                            100
                        ]
                    },
                    avgTimeSpent: 1,
                    totalPoints: 1
                }
            },
            { $sort: { date: 1 } }
        ]);
    }

    // Cevap sürelerinin dağılımı
    async getTimeDistribution(tenantId: Types.ObjectId) {
        return this.aggregate([
            { $match: { tenantId } },
            {
                $bucket: {
                    groupBy: "$timeSpent",
                    boundaries: [0, 10, 20, 30, 60, 120, 300], // saniye aralıkları
                    default: "300+",
                    output: {
                        count: { $sum: 1 },
                        avgScore: { $avg: "$earnedPoints" },
                        successRate: {
                            $avg: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] }
                        }
                    }
                }
            }
        ]);
    }
}