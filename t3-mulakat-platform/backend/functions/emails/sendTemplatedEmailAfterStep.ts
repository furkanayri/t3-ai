import { sendTemplatedEmail } from "@/utils/mail"
import checkQuote from "../quote/checkQuote"
import spendQuote from "../quote/spendQuote"
import { getAllTenantsByPopulate } from "@/utils/populate/getAllTenantsByPopulate"

type TemplateType = "job" | "candidate" | "employee" | "company"
const allowedFields: Array<`${TemplateType}.${string}`> = [
    "job.title",
    "job.jobType",
    "job.locationType",
    "candidate.name",
    "candidate.surname",
    "candidate.email",
    "candidate.phone",
    "company.name",
    "company.legalName",
    "company.email",
    "company.phone",
    "company.website",
    "company.address",
    "employee.name",
    "employee.surname",
    "employee.email",
]

export default async function sendTemplateEmailAfterStep(ctx: Context) {
    const { tenantId } = ctx.params
    const { recruitmentStageStepId, jobApplicationId } = ctx.request.body

    const jobApplication = await ctx.service("jobApplications").findOne({
        tenantId,
        _id: jobApplicationId
    })
    if (!jobApplication) {
        return ctx.throw(404, "Job application not found")
    }

    const emailConfig = await ctx.service("recruitmentEmailConfigs").findOne({
        tenantId,
        recruitmentStageStepId
    })
    if (!jobApplication) {
        return ctx.throw(404, "Recruitment Email Configuration not found")
    }

    if (emailConfig && emailConfig?.isEmailsActive
        && emailConfig.emailFlow === "auto") {
        // await checkQuote(ctx, { credit: 1, type: "email" })
        const job = await ctx.service("jobs").findOne({
            _id: jobApplication?.jobId,
            tenantId
        })

        const employee = await ctx.service("employees").findOne({
            userId: ctx.state.user._id
        })

        const tenantRes = await getAllTenantsByPopulate(ctx, { populateIds: tenantId, select: "_id name legalName email phone website address senderMailAddress" })

        const company = tenantRes.results?.[0];

        const candidate = await ctx.service("candidates").findOne({
            _id: jobApplication?.candidateId,
            tenantId
        })

        const emailContext = {
            job,
            employee,
            company,
            candidate,
        }

        //find {{ ... parameters ... }} inside html string
        const regex = /{{(.*?)}}/g;
        const matches = Array.from(emailConfig.content.matchAll(regex), m => m[1]);

        matches.forEach((matchedStr: any) => {
            if (!allowedFields.includes(matchedStr)) ctx.throw(400, "Invalid email data field was provided.")
        })
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>1")

        let contextItems = {}
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>1")

        matches.forEach(match => {
            const splitArr = match.split(".")
            const key = splitArr[0]
            const prop = splitArr[1]

            contextItems[match] = emailContext?.[key]?.[prop]
        })
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>1")
        const parsedContext = JSON.parse(JSON.stringify(emailContext))
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>2")

        ctx.state.recipient = candidate?.email;
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>3")

        ctx.state.sender = company?.senderMailAddress;
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>4")
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<parsedContext", parsedContext)
        await sendTemplatedEmail({
            config: emailConfig,
            context: parsedContext,
            recipientEmail: candidate?.email,
            sender: company?.senderMailAddress
        })

        // await spendQuote(ctx, {
        //     "credit": 1,
        //     "type": "email",
        //     "taskType": "send_progress_email"
        // })

        ctx.body = {
            isSuccess: true
        }
    }
    else {
        return ctx.throw(404, "Recruitment Step is not configured to send emails")
    }
}