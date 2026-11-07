export default async function getAllSkills(ctx: Context) {
    const { page, limit, search } = ctx.query;
    const query = {
        isDeleted: { $ne: true },
        ...(search && { name: { $regex: search, $options: 'i' } })
    };
    const options = {
        page: page || 1,
        limit: limit || 10,
        sort: '-createdAt',
    };

    const skills = await ctx.service('skills').findAll({ ...options, ...query });

    ctx.body = skills
}