import { IJob } from "@/types/entities";

export default async function getById(ctx: Context) {
    const { jobId } = ctx.params;

    const job = await ctx.service("jobs").findOne({
        _id: jobId,
        isDeleted: { $ne: true }
    },
        {
            populate: [
                {
                    path: 'skills',
                    select: 'name _id'
                },
                {
                    path: 'categoryId',
                    select: 'name _id'
                },
                {
                    path: 'hiringTeams',
                    select: "name surname _id"
                },
            ]
        }
    );

    const channelIds = job.publishedChannels.map(item => item.channelId);
    const channelRes = await ctx.service('postingChannels').findAll(
        { _id: { $in: channelIds } },
    )

    const populatedChannels = job.publishedChannels.map((item: any) => {
        const channel = channelRes.results.find(ch => ch._id.toString() === item.channelId.toString());
        return { ...item.toJSON(), channel };
    });

    const populatedJob: Partial<IJob> = {
        ...job.toJSON(),
        publishedChannels: populatedChannels
    };

    ctx.body = { job: populatedJob };
}
