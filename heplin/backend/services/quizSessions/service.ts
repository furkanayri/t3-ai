import { Model, Types } from "mongoose";
import { BaseService } from "@/utils"

export class QuizSessionsService extends BaseService<any> {
    constructor(Model: Model<any>) {
        super(Model);
    }

    // Yeni test oturumu başlat
    async createSession(sessionData: any) {
        return this.create({
            ...sessionData,
            sessionId: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'active',
            startedAt: new Date()
        });
    }

    // Aktif oturumu getir
    async getActiveSession(userId: Types.ObjectId, quizSetId: Types.ObjectId) {
        return this.findOne({
            userId,
            quizSetId,
            status: 'active'
        });
    }

    // Oturum bilgilerini getir
    async getSessionWithDetails(sessionId: string) {
        return this.aggregate([
            { $match: { sessionId } },
            {
                $lookup: {
                    from: 'quizsets',
                    localField: 'quizSetId',
                    foreignField: '_id',
                    as: 'quizSet'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$quizSet' },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    sessionId: 1,
                    attemptNumber: 1,
                    totalQuestions: 1,
                    answeredQuestions: 1,
                    correctAnswers: 1,
                    totalPoints: 1,
                    maxPossiblePoints: 1,
                    scorePercentage: 1,
                    totalTimeSpent: 1,
                    timeLimit: 1,
                    status: 1,
                    startedAt: 1,
                    completedAt: 1,
                    isPassed: 1,
                    'quizSet.title': 1,
                    'quizSet.passingScore': 1,
                    'quizSet.showResults': 1,
                    'user.name': 1,
                    'user.email': 1
                }
            }
        ]);
    }

    // Oturum ilerleme güncelle
    async updateProgress(sessionId: string, answeredQuestions: number, correctAnswers: number, totalPoints: number, timeSpent: number) {
        const scorePercentage = Math.round((totalPoints / (await this.getMaxPoints(sessionId))) * 100);
        
        return this.updateOne(
            { sessionId },
            {
                answeredQuestions,
                correctAnswers,
                totalPoints,
                scorePercentage,
                totalTimeSpent: timeSpent
            }
        );
    }

    // Oturumu tamamla
    async completeSession(sessionId: string, finalData: any) {
        const session = await this.findOne({ sessionId });
        if (!session) throw new Error('Session not found');

        const isPassed = finalData.totalPoints >= finalData.passingScore;
        
        return this.updateOne(
            { sessionId },
            {
                ...finalData,
                status: 'completed',
                completedAt: new Date(),
                isPassed
            }
        );
    }

    // Oturumu iptal et
    async abandonSession(sessionId: string) {
        return this.updateOne(
            { sessionId },
            {
                status: 'abandoned',
                completedAt: new Date()
            }
        );
    }

    // Zaman aşımı
    async timeoutSession(sessionId: string) {
        return this.updateOne(
            { sessionId },
            {
                status: 'timeout',
                completedAt: new Date()
            }
        );
    }

    // Kullanıcının tüm oturumlarını getir
    async getUserSessions(userId: Types.ObjectId, limit = 10) {
        return this.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'quizsets',
                    localField: 'quizSetId',
                    foreignField: '_id',
                    as: 'quizSet'
                }
            },
            { $unwind: '$quizSet' },
            {
                $project: {
                    _id: 1,
                    sessionId: 1,
                    attemptNumber: 1,
                    totalPoints: 1,
                    maxPossiblePoints: 1,
                    scorePercentage: 1,
                    status: 1,
                    startedAt: 1,
                    completedAt: 1,
                    isPassed: 1,
                    'quizSet.title': 1
                }
            },
            { $sort: { startedAt: -1 } },
            { $limit: limit }
        ]);
    }

    // Quiz set için tüm oturumları getir
    async getQuizSetSessions(quizSetId: Types.ObjectId, limit = 50) {
        return this.aggregate([
            { $match: { quizSetId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    sessionId: 1,
                    attemptNumber: 1,
                    totalPoints: 1,
                    maxPossiblePoints: 1,
                    scorePercentage: 1,
                    status: 1,
                    startedAt: 1,
                    completedAt: 1,
                    isPassed: 1,
                    'user.name': 1,
                    'user.email': 1
                }
            },
            { $sort: { startedAt: -1 } },
            { $limit: limit }
        ]);
    }

    // Oturum istatistikleri
    async getSessionStats(tenantId: Types.ObjectId, dateFrom?: Date, dateTo?: Date) {
        const matchFilter: any = { tenantId };
        
        if (dateFrom && dateTo) {
            matchFilter.startedAt = {
                $gte: dateFrom,
                $lte: dateTo
            };
        }

        return this.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    completedSessions: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    abandonedSessions: {
                        $sum: { $cond: [{ $eq: ["$status", "abandoned"] }, 1, 0] }
                    },
                    timedoutSessions: {
                        $sum: { $cond: [{ $eq: ["$status", "timeout"] }, 1, 0] }
                    },
                    passedSessions: {
                        $sum: { $cond: [{ $eq: ["$isPassed", true] }, 1, 0] }
                    },
                    avgScore: { $avg: "$scorePercentage" },
                    avgTimeSpent: { $avg: "$totalTimeSpent" },
                    completedCount: { 
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } 
                    }
                }
            }
        ]);
    }

    // En iyi performans gösteren kullanıcılar
    async getTopPerformers(tenantId: Types.ObjectId, limit = 10) {
        return this.aggregate([
            { 
                $match: { 
                    tenantId, 
                    status: 'completed',
                    isPassed: true 
                } 
            },
            {
                $group: {
                    _id: "$userId",
                    avgScore: { $avg: "$scorePercentage" },
                    totalCompleted: { $sum: 1 },
                    bestScore: { $max: "$scorePercentage" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    avgScore: 1,
                    totalCompleted: 1,
                    bestScore: 1,
                    'user.name': 1,
                    'user.email': 1
                }
            },
            { $sort: { avgScore: -1 } },
            { $limit: limit }
        ]);
    }

    // Maksimum puan hesapla (yardımcı fonksiyon)
    private async getMaxPoints(sessionId: string) {
        const session = await this.findOne({ sessionId });
        return session ? session.maxPossiblePoints : 0;
    }

    // Aktif oturumları temizle (cron job için)
    async cleanupStaleSessions(hoursOld = 24) {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

        return this.updateMany(
            {
                status: 'active',
                startedAt: { $lt: cutoffDate }
            },
            {
                status: 'abandoned',
                completedAt: new Date()
            }
        );
    }
}