import { Model, Types } from "mongoose";
import { BaseService } from "@/utils"

export class UserQuizAssignmentsService extends BaseService<any> {
    constructor(Model: Model<any>) {
        super(Model);
    }

    // Kullanıcının atanan testlerini getir
    async getUserAssignments(userId: Types.ObjectId, status?: string) {
        const filter: any = { userId };
        if (status) {
            filter.status = status;
        }

        return this.aggregate([
            { $match: filter },
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
                    localField: 'assignedBy',
                    foreignField: '_id',
                    as: 'assignedByUser'
                }
            },
            { $unwind: '$quizSet' },
            { $unwind: '$assignedByUser' },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    assignedAt: 1,
                    dueDate: 1,
                    attempts: 1,
                    bestScore: 1,
                    bestScorePercentage: 1,
                    priority: 1,
                    notes: 1,
                    'quizSet.title': 1,
                    'quizSet.description': 1,
                    'quizSet.totalQuestions': 1,
                    'quizSet.totalPoints': 1,
                    'quizSet.timeLimit': 1,
                    'quizSet.passingScore': 1,
                    'quizSet.maxAttempts': 1,
                    'assignedByUser.name': 1,
                    'assignedByUser.email': 1
                }
            },
            { $sort: { assignedAt: -1 } }
        ]);
    }

    // Kullanıcının aktif testlerini getir
    async getUserActiveAssignments(userId: Types.ObjectId) {
        return this.getUserAssignments(userId, 'assigned');
    }

    // Kullanıcının tamamladığı testleri getir
    async getUserCompletedAssignments(userId: Types.ObjectId) {
        return this.getUserAssignments(userId, 'completed');
    }

    // Admin: Tüm atamaları getir
    async getAllAssignments(tenantId: Types.ObjectId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        return this.aggregate([
            { $match: { tenantId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'quizsets',
                    localField: 'quizSetId',
                    foreignField: '_id',
                    as: 'quizSet'
                }
            },
            { $unwind: '$user' },
            { $unwind: '$quizSet' },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    assignedAt: 1,
                    dueDate: 1,
                    attempts: 1,
                    bestScore: 1,
                    bestScorePercentage: 1,
                    priority: 1,
                    'user.name': 1,
                    'user.email': 1,
                    'quizSet.title': 1,
                    'quizSet.totalPoints': 1
                }
            },
            { $sort: { assignedAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
    }

    // Süresi geçen atamaları bul
    async getOverdueAssignments(tenantId: Types.ObjectId) {
        const now = new Date();
        
        return this.updateMany(
            {
                tenantId,
                dueDate: { $lt: now },
                status: { $in: ['assigned', 'started'] }
            },
            {
                status: 'overdue'
            }
        );
    }

    // Test başlatma
    async startQuiz(assignmentId: Types.ObjectId) {
        return this.update(assignmentId, {
            status: 'started',
            startedAt: new Date()
        });
    }

    // Test tamamlama
    async completeQuiz(assignmentId: Types.ObjectId, finalScore: number, scorePercentage: number) {
        const assignment = await this.findById(assignmentId.toString());
        if (!assignment) throw new Error('Assignment not found');

        const updateData: any = {
            status: 'completed',
            completedAt: new Date(),
            attempts: assignment.attempts + 1,
            lastAttemptAt: new Date()
        };

        // En iyi skoru güncelle
        if (!assignment.bestScore || finalScore > assignment.bestScore) {
            updateData.bestScore = finalScore;
            updateData.bestScorePercentage = scorePercentage;
        }

        return this.update(assignmentId, updateData);
    }

    // Deneme sayısını artır
    async incrementAttempts(assignmentId: Types.ObjectId) {
        return this.update(assignmentId, {
            $inc: { attempts: 1 },
            lastAttemptAt: new Date()
        });
    }

    // Atamayı iptal et
    async cancelAssignment(assignmentId: Types.ObjectId) {
        return this.update(assignmentId, {
            status: 'cancelled'
        });
    }

    // Kullanıcı istatistikleri
    async getUserStats(userId: Types.ObjectId) {
        return this.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalAssigned: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ["$status", "started"] }, 1, 0] }
                    },
                    overdue: {
                        $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] }
                    },
                    avgScore: {
                        $avg: {
                            $cond: [
                                { $ne: ["$bestScorePercentage", null] },
                                "$bestScorePercentage",
                                0
                            ]
                        }
                    },
                    totalAttempts: { $sum: "$attempts" }
                }
            }
        ]);
    }

    // Tenant istatistikleri  
    async getTenantStats(tenantId: Types.ObjectId) {
        return this.aggregate([
            { $match: { tenantId } },
            {
                $group: {
                    _id: null,
                    totalAssignments: { $sum: 1 },
                    completedCount: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    pendingCount: {
                        $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] }
                    },
                    overdueCount: {
                        $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] }
                    },
                    avgCompletionRate: {
                        $avg: {
                            $cond: [
                                { $ne: ["$bestScorePercentage", null] },
                                "$bestScorePercentage",
                                0
                            ]
                        }
                    }
                }
            }
        ]);
    }

    // Son teslim tarihine göre hatırlatma listesi
    async getUpcomingDeadlines(tenantId: Types.ObjectId, days = 3) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return this.findAll({
            tenantId,
            status: { $in: ['assigned', 'started'] },
            dueDate: {
                $gte: new Date(),
                $lte: futureDate
            }
        });
    }
}