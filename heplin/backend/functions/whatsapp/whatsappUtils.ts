import { whatsappMessage } from "@/utils/whatsapp/sendFlow";
import { Types } from "mongoose";
export async function applyjowWithWhatsapp(ctx: Context, checkUser, job, from, phon_no_id, exsistCv) {
    const findCandidate = await ctx.service("candidates").findOne({
        tenantId: job.tenantId,
        userId: checkUser._id,
    });
    const findJobApplication = await ctx.service("jobApplications").findOne({
        jobId: job._id,
        userId: checkUser._id,
    });
    if (findJobApplication) {
        await whatsappMessage(
            from,
            phon_no_id,
            `Bu pozisyona daha önce başvurdunuz! Başvurunuz zaten sistemimizde kayıtlı. Başvurduğunuz iş: ${job.title}.`
        );
        ctx.body = "user already applied for this job";
        return;
    }
    const employeeApplicationCounts = await Promise.all(
        job.hiringTeams.map(async (employeeId) => {
            const count = await ctx.service("jobApplications").count({
                jobId: job._id,
                employeeId,
            });
            return { employeeId, count };
        })
    );

    let leastAssignedEmployee = employeeApplicationCounts[0];
    for (const employee of employeeApplicationCounts) {
        if (employee.count < leastAssignedEmployee.count) {
            leastAssignedEmployee = employee;
        }
    }

    const employeeId = leastAssignedEmployee.employeeId;

    if (!checkUser?._id || (typeof checkUser._id !== 'string' && !(checkUser._id instanceof Types.ObjectId))) {
        ctx.throw(404, "User not found");
    }
    if (!job?._id || (typeof job._id !== 'string' && !(job._id instanceof Types.ObjectId))) {
        ctx.throw(404, "Job not found");
    }
    let candidate = findCandidate;
    if (!findCandidate) {
        candidate = await ctx.service("candidates").create({
            userId: checkUser._id,
            tenantId: job.tenantId,
            skills: [],
            languageSkills: [],
            name: checkUser.name,
            surname: checkUser.surname,
            email: checkUser.email,
        });
    }


    const recruitmentStage = await ctx.service("recruitmentStages").findOne({
        _id: job.recruitmentStageId,
    });
    const step = recruitmentStage.stepsSort[0];
    if (!exsistCv) {
        await whatsappMessage(from, phon_no_id, `Lütfen Özgeçmiş yükleyin.`);
        ctx.body = "complete job application111111";
        return;
    }
    await ctx.service("jobApplications").create({
        jobId: job._id,
        userId: checkUser._id,
        tenantId: job.tenantId,
        cv: exsistCv.cvId,
        employeeId: employeeId,
        currentRecruitmentStepId:
            step instanceof Types.ObjectId ? step : (step as any)._id,
        isAppliedViaWhatsapp: true,
        candidateId: candidate._id as Types.ObjectId,
    });

    await whatsappMessage(
        from,
        phon_no_id,
        `Başvurunuz başarıyla alındı! Başvurduğunuz iş: ${job.title}. `
    );

    ctx.body = "complete job application";
    return;
}

export async function listTenants(ctx) {
    const jobs = await ctx.service("jobs").findAll({
        publishedChannels: {
            $elemMatch: {
                status: "published",
            },
        },
        status: "active",
    });
    console.log(jobs, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    const uniqueTenantIds = [...new Set(jobs.results.map(job => job.tenantId.toString()))];
    const tenants = await ctx.service("tenants").findAll({}, {
        query: {
            _id: { $in: uniqueTenantIds },
            isDeleted: false,
            status: "active",
        },
    });
    console.log(tenants.results, "121212");


    return tenants.results
}
