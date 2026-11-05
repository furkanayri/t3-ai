import { Types } from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { s3Client } from "@/utils";
import pdftoJson from "../../utils/pdftoJson";
import { uuid } from "uuidv4";
import slugify from "slugify";
import { ITenant } from "@/types/entities";

/**
 * applyjobWithTelegram:
 * 
 * - Telegram üzerinden iş başvurusu yapıldığında bu fonksiyon tetiklenir.
 * - Kullanıcı (checkUser) daha önce aynı işe başvurmuş mu kontrol eder.
 * - Başvuru yoksa, yeni jobApplication kaydı oluşturur.
 * - Kullanıcıya Telegram üzerinden mesaj gönderir.
 */
export const generateFileKey = (fileName) => {
    return uuid() + "-" + slugify(fileName, {
        lower: true,
        trim: true,
        remove: /[*+~()'"!:@]/g,
    });
};

export async function applyjobWithTelegram(
    ctx: Context,
    user: any,
    selectedJob: any,
    tenantId: any,  // <--- parametre ismi değişti
    chatId: number,
    bot: TelegramBot,
) {

    // 1) Daha önce başvuru var mı kontrol et
    const findJobApplication = await ctx.service("jobApplications").findOne({
        jobId: selectedJob._id,
        userId: user._id,
    });
    if (findJobApplication) {
        // Bu işe daha önce başvurmuş
        await bot.sendMessage(
            chatId,
            `Bu pozisyona daha önce başvurdunuz! Başvurunuz zaten sistemimizde kayıtlı.\n\nBaşvurduğunuz iş: ${selectedJob.title}`
        );

        return;
    }
    const tenantDoc: ITenant = await ctx.service("tenants").findOne({ _id: tenantId });
    // 2) En az ataması olan employeeId’yi bul (tenant ekibinden)
    const employeeApplicationCounts = await Promise.all(
        selectedJob?.hiringTeams.map(async (employeeId: any) => {
            const count = await ctx.service("jobApplications").count({
                jobId: selectedJob._id,
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

    // 3) Kontroller
    if (
        !user._id ||
        (typeof user._id !== "string" && !(user._id instanceof Types.ObjectId))
    ) {
        ctx.throw(404, "User not found");
    }
    if (
        !tenantDoc?._id ||
        (typeof tenantDoc._id !== "string" && !(tenantDoc._id instanceof Types.ObjectId))
    ) {
        ctx.throw(404, "Tenant not found");
    }

    // 4) Candidate tablosunda var mı yok mu bak. Yoksa oluştur:
    const findCandidate = await ctx.service("candidates").findOne({
        tenantId: tenantId,
        userId: user._id,
    });

    let candidate = findCandidate;
    if (!findCandidate) {
        candidate = await ctx.service("candidates").create({
            userId: user._id,
            tenantId: tenantId,
            skills: [],
            languageSkills: [],
            name: user.name,
            surname: user.surname,
            email: user.email,
        });
    }
    console.log(candidate, '????????????????????????????????????');


    // 5) recruitmentStages vs.
    const recruitmentStage = await ctx.service("recruitmentStages").findOne({
        _id: selectedJob.recruitmentStageId,
    });
    const step = recruitmentStage.stepsSort[0];
    const exsistCv = await ctx
        .service("candidateCv")
        .findOne({ userId: user._id });
    // 6) jobApplication kaydet
    await ctx.service("jobApplications").create({
        jobId: selectedJob._id,
        userId: user._id,
        tenantId:
            tenantId instanceof Types.ObjectId
                ? tenantId
                : (tenantId as any)._id,
        cv: exsistCv?.cvId, // exsistCv varsa, ilgili CV ID
        employeeId: employeeId,
        currentRecruitmentStepId:
            step instanceof Types.ObjectId ? step : (step as any)._id,
        isAppliedViaTelegram: true, // WhatsApp yerine Telegram
        candidateId: candidate._id as Types.ObjectId,

    });

    // 7) Kullanıcıya Telegram üzerinden bilgilendirme mesajı
    await bot.sendMessage(
        chatId,
        `Başvurunuz başarıyla alındı!\nBaşvurduğunuz iş: ${selectedJob.title}`
    );

    // 8) CV’si yoksa?
    if (!exsistCv) {
        await bot.sendMessage(chatId, "Lütfen Özgeçmiş yükleyin.");
        return;
    }

    return;
}


export async function telegramTakeCv(fileLink: string) {
    try {
        // 1) Download PDF from Telegram
        const mediaResponse = await axios.get(fileLink, { responseType: "arraybuffer" });
        // 2) Parse PDF
        const pdfData = await pdftoJson(Buffer.from(mediaResponse.data));
        // 3) Upload to S3
        const fileName = generateFileKey("telegram-media-file.pdf");
        const s3Upload = await s3Client.upload({
            Bucket: process.env.AWS_BUCKET_PRIVATE,
            Key: fileName,
            Body: Buffer.from(mediaResponse.data),
            ContentType: "application/pdf"
        }).promise();

        return {
            isSuccess: true,
            key: s3Upload.Key,
            pdfData,
        };
    } catch (error) {
        console.error("Telegram CV indirme veya yükleme hatası:", error);
        return {
            isSuccess: false,
            message: "Dosya indirme veya yükleme sırasında bir hata oluştu.",
        };
    }
}