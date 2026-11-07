import { Context } from 'koa';

// Kullanıcıya quiz atama
export default async function assignQuizToUser(ctx: Context) {
    try {
        const {
            userId,
            quizSetId,
            dueDate,
            notes,
            priority = 'medium'
        } = ctx.request.body;

        // Validation
        if (!userId) {
            ctx.status = 400;
            ctx.body = { error: 'Kullanıcı ID zorunludur' };
            return;
        }

        if (!quizSetId) {
            ctx.status = 400;
            ctx.body = { error: 'Quiz set ID zorunludur' };
            return;
        }

        // Quiz set'in varlığını kontrol et
        const quizSet = await ctx.service('quizSets').findOne({
            _id: quizSetId,
            tenantId: ctx.params.tenantId,
            isActive: true
        });

        if (!quizSet) {
            ctx.status = 404;
            ctx.body = { error: 'Quiz set bulunamadı' };
            return;
        }

        // Kullanıcının varlığını kontrol et
        const user = await ctx.service('users').findOne({
            _id: userId,
        });

        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'Kullanıcı bulunamadı' };
            return;
        }

        // Aynı kullanıcıya aynı quiz set zaten atanmış mı kontrol et
        const existingAssignment = await ctx.service('userQuizAssignments').findOne({
            userId,
            quizSetId,
            tenantId: ctx.params.tenantId,
            status: { $in: ['assigned', 'started'] }
        });

        if (existingAssignment) {
            ctx.status = 400;
            ctx.body = {
                error: 'Bu quiz set kullanıcıya zaten atanmış',
                assignment: existingAssignment
            };
            return;
        }

        // Assignment oluştur
        const assignmentData = {
            userId,
            quizSetId,
            tenantId: ctx.params.tenantId,
            assignedBy: ctx.state.user?._id,
            assignedAt: new Date(),
            dueDate: dueDate ? new Date(dueDate) : null,
            status: 'assigned',
            attempts: 0,
            notes: notes?.trim(),
            priority
        };

        const assignment = await ctx.service('userQuizAssignments').create(assignmentData);

        ctx.body = {
            success: true,
            data: assignment,
            message: 'Quiz başarıyla atandı'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            error: 'Quiz atanırken bir hata oluştu',
            details: error.message
        };
    }
}
