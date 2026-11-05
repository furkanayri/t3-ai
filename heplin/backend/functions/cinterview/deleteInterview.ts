
export default async function deleteInterview(ctx: Context) {
    const { tenantId, interviewId } = ctx.params
    const { user } = ctx.state;
    // silindiğinde bağlı olan tüm questionlar silinmeli

    const interview = await ctx.service('interview').softDelete({
        _id: interviewId,
    }, user?._id);
    ctx.body = { interview };
}