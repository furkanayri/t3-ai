export default async function increaseView(ctx: Context) {
    const { jobId } = ctx.params;
    const jobsService = ctx.service("jobs");

    try {
        const job = await jobsService.findOne({ _id: jobId });
        if (!job) {
            ctx.status = 404; 
            ctx.body = {
                isSuccess: false,
                message: "İş bulunamadı."
            };
            return;
        }

        const updatedJob = await jobsService.updateOne(
            { _id: jobId },
            { $inc: { viewNumber: 1 } }
        );

        ctx.body = {
            isSuccess: true,
        };
    } catch (error) {
        ctx.status = 500; 
        ctx.body = {
            isSuccess: false,
            message: "Bir hata oluştu.",
            error: error.message
        };
    }
}
