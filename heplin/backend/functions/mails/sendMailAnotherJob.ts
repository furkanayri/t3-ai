import { ICandidateOnboarding, IJobApplication } from "@/types/entities";
import sendEmail from "@/utils/mail/sendMail";

export default async function sendMailAnotherJob(ctx: Context) {
    const { tenantId } = ctx.params;
   console.log('sendMailAnotherJob', ctx.request.body)
   const { candidateId, candidateEmail, jobId,jobTitle } = ctx.request.body 

try {
   if(jobId && candidateId){
     const Link = `${process.env.WEB_APP_URL}/apply/${jobId}`
    await sendEmail("mail@heplin.com", candidateEmail, "İş ilanı daveti", "inviteAnotherJob", {
        link: Link,
        jobName:jobTitle
    })
   };

   ctx.body = {
    isSuccess: true,
};
    
} catch (error) {
    console.error("Mail sending failed:", error);
    ctx.throw(500, "Mail sending failed");
}}