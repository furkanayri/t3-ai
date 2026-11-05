import { sendDisqualifiedEmail } from "@/utils/mail";

export default async function sendDisqualifyMailCronJob(ctx: Context) {
    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const threeDaysAgoYear = threeDaysAgo.getFullYear();
        const threeDaysAgoMonth = threeDaysAgo.getMonth();
        const threeDaysAgoDate = threeDaysAgo.getDate();

    const disqualifiedApplications = await ctx.service("jobApplications").findAll({
        status: 'disqualified'
    });
    for (const application of disqualifiedApplications.results) {
              const disqualifyEmailTemplate = await ctx.service("disqualifyEmailTemplates").findOne({ tenantId: application?.tenantId });
        const disqualifyTimestamp = new Date(application.disqualifyTimestamp);
        const disqualifyYear = disqualifyTimestamp.getFullYear();
        const disqualifyMonth = disqualifyTimestamp.getMonth();
        const disqualifyDate = disqualifyTimestamp.getDate();
        const jobId = application.jobId;
        const job = await ctx.service("jobs").findOne({ _id: jobId });
        if (
            disqualifyYear === threeDaysAgoYear &&
            disqualifyMonth === threeDaysAgoMonth &&
            disqualifyDate === threeDaysAgoDate
        ) {
            const user = await ctx.service("users").findOne({ _id: application.userId });
            console.log(user?.email);
            
            if (user) {
                const tenant = await ctx.service("tenants").findOne({ _id: application.tenantId });
                await sendDisqualifiedEmail({ sender: tenant?.senderMailAddress, email: user?.email, jobTitle: job?.title,customMailContent:disqualifyEmailTemplate?.description });            }
        }
    }
        ctx.body =  { success: true, message: "Disqualify emails sent successfully" };
    } catch (error) {
        console.error("Error in sendDisqualifyMailCronJob:", error);
        ctx.status = 500;
        return { success: false, message: "Failed to send disqualify emails", error: error.message };
    }
}
