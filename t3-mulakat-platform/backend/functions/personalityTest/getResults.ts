import { Context } from 'koa';

// Test sonuçlarını getir
export default async function getResults(ctx: Context) {
    try {
        const userId = ctx.state.user?._id;
        const { sessionId } = ctx.params;

        // Session kontrolü
        const session = await ctx.service('personalityTestSession').findById(sessionId);
        if (!session) {
            ctx.status = 404;
            ctx.body = {
                error: 'Test oturumu bulunamadı'
            };
            return;
        }

        // Kullanıcı kontrolü
        if (session.userId.toString() !== userId.toString()) {
            ctx.status = 403;
            ctx.body = {
                error: 'Bu test oturumuna erişim yetkiniz yok'
            };
            return;
        }

        if (session.status !== 'completed') {
            ctx.status = 400;
            ctx.body = {
                error: 'Test henüz tamamlanmadı'
            };
            return;
        }

        // Alt boyut bazlı skorları hesapla
        const subDimensionScores = await ctx.service('personalityTestAnswer').aggregate([
            { $match: { sessionId: session._id } },
            {
                $group: {
                    _id: '$subDimension',
                    averageScore: { $avg: '$calculatedScore' },
                    questionCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    subDimension: '$_id',
                    averageScore: { $round: ['$averageScore', 2] },
                    questionCount: 1,
                    _id: 0
                }
            },
            { $sort: { averageScore: -1 } }
        ]);

        // Genel ortalama hesapla
        const overallResult = await ctx.service('personalityTestAnswer').aggregate([
            { $match: { sessionId: session._id } },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$calculatedScore' },
                    totalQuestions: { $sum: 1 }
                }
            }
        ]);

        const overallScore = overallResult.length > 0 
            ? Math.round(overallResult[0].averageScore * 100) / 100 
            : 0;

        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                sessionInfo: {
                    sessionId: session._id,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    totalQuestions: session.totalQuestions,
                    answeredQuestions: session.answeredQuestions
                },
                overallScore,
                subDimensionScores,
                totalSubDimensions: subDimensionScores.length
            }
        };

    } catch (error: any) {
        console.error('Get results error:', error);
        ctx.status = 500;
        ctx.body = {
            error: 'Sonuçlar getirilirken bir hata oluştu',
            details: error.message
        };
    }
}
