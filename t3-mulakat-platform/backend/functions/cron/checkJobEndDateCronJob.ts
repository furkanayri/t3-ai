import moment from "moment";
import mongoose from "mongoose";

export default async function checkJobEndDateCronJob(ctx: Context) {

  try {
    const today = moment().startOf("day").add(3, "hours").toDate();

    const jobs = await ctx.service("jobs").findAll({ status: "active" });

    if (!jobs || !Array.isArray(jobs.results)) {
      console.warn("No jobs found or jobs format is invalid");
      return { success: false, message: "No active jobs found" };
    }

    for (const job of jobs.results) {
      if (job.endDate && moment(job.endDate).startOf("day").isBefore(today)) {
        if (Array.isArray(job.publishedChannels)) {
          job.publishedChannels = job.publishedChannels.map((channel) => ({
            ...channel,
            status: "closed",
          }));
        }

        const jobId = job._id?.toString?.();
        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
          console.warn("Invalid job id:", job._id);
          continue; // hata fırlatma, diğer işlere devam et
        }

        await ctx.service("jobs").update(jobId, {
          publishedChannels: job.publishedChannels,
        });

      }
    }

    ctx.body =  { success: true, message: "Job end dates checked successfully" };
  } catch (error) {
    console.error("Error in checkJobEndDateCronJob:", error);
    ctx.status = 500;
    return {
      success: false,
      message: "Failed to check job end dates",
      error: error.message,
    };
  }
}
