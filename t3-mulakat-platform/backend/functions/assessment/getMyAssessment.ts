import { Context } from 'koa';
import { buildAssessmentStages } from './utils';

export default async function getMyAssessment(ctx: Context) {
    const userId = ctx.state.user?._id;
    const assignmentId = ctx.params.assignmentId || ctx.query.assignmentId;

    const filter: any = assignmentId
        ? { _id: assignmentId, userId }
        : { userId, status: { $in: ['assigned', 'in-progress', 'completed'] } };

    const assignment = await ctx.service('assessmentAssignment').findOne(
        filter,
        { populate: [{ path: 'assessmentProcessId' }] }
    );

    if (!assignment) {
        ctx.body = { assignment: null, stages: [] };
        return;
    }

    const { process, stages, allRequiredDone } = await buildAssessmentStages(ctx, userId, assignment);

    ctx.body = {
        assignment: {
            id: assignment._id,
            status: allRequiredDone ? 'completed' : assignment.status,
            sequential: Boolean(process.sequential),
            processTitle: process.title,
            processDescription: process.description,
        },
        stages,
    };
}
