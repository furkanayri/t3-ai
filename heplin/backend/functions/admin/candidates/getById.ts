export default async function getById(ctx: Context) {
    const { candidateId } = ctx.params

    const candidate = await ctx.service('candidates').findAll({
        _id: candidateId
    }, {
        populate: [
            {
                path: 'userId',
                select: '_id name surname email phone avatar'
            },
            {
                path: 'tenantId',
                select: '_id name'
            }
        ]
    })

    ctx.body = { candidate }
}