import { parseExcelFile, generateTempPassword } from "@/utils/excelParser";
import sendEmail from "@/utils/mail/sendMail";
import moment from "moment";
import bcrypt from "bcryptjs";
import multer from "@koa/multer";
import { ObjectId } from "@/types/entities";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

export default async function bulkInterviewInvitation(ctx: Context) {
    await upload.single("excel")(ctx, async () => { });

    const file = ctx.file;
    const { tenantId, interviewId } = ctx.params;
    const { interviewType } = ctx.request.body;

    if (!file) {
        ctx.throw(400, "Excel dosyası yüklenmedi");
    }

    if (!interviewType || !['video', 'text'].includes(interviewType)) {
        ctx.throw(400, "Geçerli bir mülakat tipi seçiniz (video/text)");
    }

    const parseResult = parseExcelFile(file.buffer);

    if (!parseResult.success || parseResult.data.length === 0) {
        ctx.status = 400;
        ctx.body = {
            success: false,
            errors: parseResult.errors,
            message: "Excel dosyası işlenemedi"
        };
        return;
    }

    const tenant = await ctx.service("tenants").findOne({ _id: tenantId });
    const interview = await ctx.service('interview').findById(interviewId);
    const interviewQuestion = await ctx.service('interviewQuestions').findOne({ interviewId: interview._id });

    let questionTimeSum = 0;
    if (interviewQuestion && interviewQuestion.questions) {
        questionTimeSum = interviewQuestion.questions.reduce((sum, question) => {
            return sum + (question.duration || 0);
        }, 0);
    }

    const results = {
        success: [],
        failed: [],
        total: parseResult.data.length
    };

    for (const candidateData of parseResult.data) {
        try {
            let user = await ctx.service("users").findOne({
                email: candidateData.email
            });

            if (user) {
                results.failed.push({
                    name: `${candidateData.firstName} ${candidateData.lastName}`,
                    email: candidateData.email,
                    error: "Kullanıcı zaten kayıtlı"
                });
                continue;
            }

            const tempPassword = generateTempPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            user = await ctx.service("users").create({
                email: candidateData.email,
                password: hashedPassword,
                name: candidateData.firstName,
                surname: candidateData.lastName,
                preferredLanguage: "tr",
                status: "active",
                isDeleted: false,
                isAcceptedTOS: false,
                isAcceptedKVKK: false,
                isTenantMember: false,
                registeredAt: new Date(),
            } as any);

            const candidate = await ctx.service("candidates").create({
                userId: user._id as ObjectId,
                name: candidateData.firstName,
                surname: candidateData.lastName,
                email: candidateData.email,
                tenantId: tenantId as ObjectId,
            } as any);

            const candidateInterviewAnswers = await ctx.service('candidateInterviewAnswers').create({
                userId: user._id as ObjectId,
                interviewId: interview._id as ObjectId,
            } as any);

            const candidateInterview = await ctx.service('candidateInterview').create({
                name: interview.name,
                totalDuration: questionTimeSum || 0,
                userId: user._id as ObjectId,
                candidateId: candidate._id as ObjectId,
                interviewId: interview._id as ObjectId,
                interviewType: interviewType,
                candidateAnswersId: candidateInterviewAnswers._id as ObjectId,
            } as any);

            const createdAt = candidateInterview.createdAt;
            const expirationDate = moment(createdAt).add(7, "days").toDate(); // 7 gün geçerli
            const expirationDateFormatted = moment(expirationDate).format("DD/MM/YYYY HH:mm");

            await sendEmail(
                tenant.senderMailAddress,
                candidate.email,
                "Bulk Interview Invitation",
                "bulkInterviewInvitation",
                {
                    name: candidate.name,
                    surname: candidate.surname,
                    interviewName: interview.name,
                    interviewType: interviewType === 'video' ? 'Görüntülü Mülakat' : 'Yazılı Mülakat',
                    expirationDate: expirationDateFormatted,
                    link: process.env.WEB_APP_URL + `/interviews/${candidateInterview._id}`,
                    email: candidate.email,
                    tempPassword: tempPassword,
                }
            );

            await ctx.service("candidateInterview").updateOne(
                { _id: candidateInterview._id },
                {
                    mailSent: true,
                    expirationDate: expirationDate,
                }
            );

            results.success.push({
                name: `${candidateData.firstName} ${candidateData.lastName}`,
                email: candidateData.email,
                interviewId: candidateInterview._id
            });

        } catch (error) {
            results.failed.push({
                name: `${candidateData.firstName} ${candidateData.lastName}`,
                email: candidateData.email,
                error: error.message || "Bilinmeyen hata"
            });
        }
    }

    ctx.body = {
        success: true,
        results: results,
        message: `${results.success.length}/${results.total} aday başarıyla davet edildi`
    };
}
