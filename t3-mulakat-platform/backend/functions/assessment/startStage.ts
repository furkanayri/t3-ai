import { Context } from 'koa';
import { createInterviewInstance, createQuizInstance } from './utils';

export default async function startStage(ctx: Context) {
    const userId = ctx.state.user?._id;
    const { assignmentId, stageId } = ctx.params;

    const assignment = await ctx.service('assessmentAssignment').findOne({ _id: assignmentId, userId });
    if (!assignment) ctx.throw(404, 'Atama bulunamadi');

    const stage = await ctx.service('assessmentStage').findOne({ _id: stageId });
    if (!stage) ctx.throw(404, 'Asama bulunamadi');

    let progress = await ctx.service('assessmentStageProgress').findOne({ assignmentId, stageId });

    // Zaten bir somut kayit olusturulmussa onu don
    if (progress && progress.refInstanceId) {
        ctx.body = { refInstanceId: progress.refInstanceId, type: stage.type };
        return;
    }

    let refInstanceId: any = null;
    if (stage.type === 'text_interview' || stage.type === 'video_interview') {
        refInstanceId = await createInterviewInstance(ctx, userId, assignment.tenantId, stage);
    } else if (stage.type === 'quiz') {
        refInstanceId = await createQuizInstance(ctx, userId, assignment.tenantId, stage);
    }
    // personality_test: somut kayit start sirasinda olusmaz; mevcut InventoryTest akisi yonetir

    if (!progress) {
        progress = await ctx.service('assessmentStageProgress').create({
            assignmentId,
            stageId,
            userId,
            tenantId: assignment.tenantId,
            type: stage.type,
            refInstanceId,
            startedAt: new Date(),
        } as any);
    } else {
        progress = await ctx.service('assessmentStageProgress').updateOne(
            { _id: progress._id },
            { refInstanceId, startedAt: new Date() }
        );
    }

    if (assignment.status === 'assigned') {
        await ctx.service('assessmentAssignment').updateOne(
            { _id: assignmentId },
            { status: 'in-progress' }
        );
    }

    ctx.body = { refInstanceId, type: stage.type };
}
