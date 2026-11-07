import { Context } from 'koa';

export default async function updateAssessmentProcess(ctx: Context) {
    const { tenantId, processId } = ctx.params;
    const payload = { ...ctx.request.body, tenantId };
    // stagesSort yonetimi reorder endpoint'inde yapilir
    delete payload.stagesSort;
    const assessmentProcess = await ctx.service('assessmentProcess').updateOne(
        { _id: processId, tenantId },
        payload
    );
    ctx.body = { assessmentProcess };
}
