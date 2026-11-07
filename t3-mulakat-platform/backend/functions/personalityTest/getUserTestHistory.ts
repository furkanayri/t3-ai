import { Context } from 'koa';

// Kullanıcının test geçmişini getir
export default async function getUserTestHistory(ctx: Context) {
    try {
        const userId = ctx.state.user?._id;
        const tenantId = ctx.params.tenantId;

        // Kullanıcının tüm test oturumlarını getir
        const sessions = await ctx.service('personalityTestSession').find({
            userId,
            tenantId
        }).sort({ startTime: -1 });

        // Her session için özet bilgi hazırla
        const history = await Promise.all(sessions.map(async (session: any) => {
            let subDimensionScores = null;
            let overallScore = null;

            // Eğer test tamamlandıysa skorları hesapla
            if (session.status === 'completed') {
                const scores = await ctx.service('personalityTestAnswer').aggregate([
                    { $match: { sessionId: session._id } },
                    {
                        $group: {
                            _id: '$subDimension',
                            averageScore: { $avg: '$calculatedScore' }
                        }
                    }
                ]);

                subDimensionScores = scores;

                const overall = await ctx.service('personalityTestAnswer').aggregate([
                    { $match: { sessionId: session._id } },
                    {
                        $group: {
                            _id: null,
                            averageScore: { $avg: '$calculatedScore' }
                        }
                    }
                ]);

                overallScore = overall.length > 0 ? Math.round(overall[0].averageScore * 100) / 100 : null;
            }

            return {
                sessionId: session._id,
                status: session.status,
                startTime: session.startTime,
                endTime: session.endTime,
                answeredQuestions: session.answeredQuestions,
                totalQuestions: session.totalQuestions,
                overallScore,
                subDimensionCount: subDimensionScores ? subDimensionScores.length : 0
            };
        }));

        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                totalTests: history.length,
                completedTests: history.filter((h: any) => h.status === 'completed').length,
                history
            }
        };

    } catch (error: any) {
        console.error('Get user test history error:', error);
        ctx.status = 500;
        ctx.body = {
            error: 'Test geçmişi getirilirken bir hata oluştu',
            details: error.message
        };
    }
}
