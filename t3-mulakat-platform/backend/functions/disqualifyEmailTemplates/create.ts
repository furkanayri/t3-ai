export default async function create(ctx: Context) {
    const { tenantId } = ctx.params;
    console.log('tenantId', tenantId);

  

    const existingTemplate = await ctx.service("disqualifyEmailTemplates").findOne({
        tenantId: tenantId,
        isDeleted: { $ne: true }
    }, );

    if (existingTemplate) {
        ctx.body = {
            message: 'Bu tenant için zaten bir diskalifiye mail şablonu mevcut.'
        };
        ctx.status = 400; 
        return;
    }
    
    const payload = {
        tenantId,
        ...ctx.request.body
    };
    console.log('payload', payload);
    const res = await ctx.service('disqualifyEmailTemplates').create(payload);
    ctx.body = {
        message: 'Yeni diskalifiye mail şablonu başarıyla oluşturuldu.',
        res
    };
}
