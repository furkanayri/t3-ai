export default async function getAllMeetingsOfUser(ctx: Context) {
    const { user } = ctx.state;

    const userCandidates = await ctx.service('candidates').findAll({
        userId: user._id
    });

    console.log('userCandidates', userCandidates.results.map((item: any) => item._id))

    const meetings = await ctx.service('meetings').findAll({
        candidateId: {
            $in: userCandidates.results.map((item: any) => item._id)
        },
    });

    const createdByUserIds = meetings.results.map((item: any) => item.createdBy?.toString()).filter(Boolean);

    const userRes = await ctx.service('users').findAll({
        _id: {
            $in: [...createdByUserIds]
        }
    });

    ctx.body = {
        ...meetings,
        results: meetings.results.filter(item => !!item.candidateId).map((item) => {
            const creator = userRes.results?.find((user: any) => user._id?.toString() === item.createdBy?.toString())
            return {
                ...item.toJSON(),
                createdBy: {
                    _id: creator?._id,
                    name: creator?.name,
                    surname: creator?.surname,
                    email: creator?.email
                }
            }
        })
    }
}