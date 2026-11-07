import { Context } from 'koa';
import { buildAssessmentStages } from './utils';

export default async function getMyAssessments(ctx: Context) {
    const userId = ctx.state.user?._id;

    const result = await ctx.service('assessmentAssignment').findAll(
        {
            userId,
            status: { $in: ['assigned', 'in-progress', 'completed'] },
            limit: 1000,
            sort: '-assignedAt',
        } as any,
        { populate: [{ path: 'assessmentProcessId' }] }
    );

    const assignments: any[] = [];
    for (const assignment of result.results) {
        // Surec silinmisse atlanir
        if (!assignment.assessmentProcessId) continue;

        const { process, stages, allRequiredDone } = await buildAssessmentStages(ctx, userId, assignment);
        const completedStages = stages.filter((s: any) => s.status === 'completed').length;

        assignments.push({
            id: assignment._id,
            processTitle: process.title,
            processDescription: process.description,
            status: allRequiredDone ? 'completed' : assignment.status,
            sequential: Boolean(process.sequential),
            totalStages: stages.length,
            completedStages,
            stageTypes: stages.map((s: any) => s.type),
            dueDate: assignment.dueDate ?? null,
            assignedAt: assignment.assignedAt ?? null,
        });
    }

    ctx.body = { assignments };
}
