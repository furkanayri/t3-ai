import { Context } from "koa";
import { promises as fsPromises } from "fs";
import { s3Client } from "@/utils";
import slugify from "slugify";
import { v4 as uuid } from "uuid";
import koaBody from "koa-body";
import { Types } from "mongoose";
import streamToBuffer from "stream-to-buffer";
import { GeminiChatCompletion } from "@/utils/GeminiChatCompletion";
import { CandidateEvaluationGeminiSchema } from "@/utils/candidateGeminiEvaluation";
import geminiPdftoJson from "@/utils/geminiPdftoJson";
const pdf = require("pdf-parse");

function generateFileKey(fileName: string) {
    return (
        uuid() +
        "-" +
        slugify(fileName, {
            lower: true,
            trim: true,
            remove: /[*+~()'"!:@]/g,
        })
    );
}

const actualKoaBodyMiddleware = koaBody({
    multipart: true,
    formidable: {
        keepExtensions: true,
        multiples: true,
        maxFileSize: 100 * 1024 * 1024, // 100MB
    },
});

export default async function bulkCVUpload(ctx: Context) {
    try {
        await actualKoaBodyMiddleware(ctx, async () => { });

        const { tenantId } = ctx.params;
        const { jobId, userId } = ctx.request.body;
        const uploaded = ctx.request.files;

        // İstek parametrelerini daha detaylı doğrulama
        if (!uploaded) {
            ctx.throw(400, "Dosya yüklenemedi. Lütfen dosya seçtiğinizden emin olun");
        }

        if (!jobId) {
            ctx.throw(400, "jobId parametresi eksik. İş ilanı ID'si gerekli");
        }


        const filesArray: any[] = uploaded.files ?
            Array.isArray(uploaded.files) ? uploaded.files : [uploaded.files] :
            Object.values(uploaded).flat();

        if (filesArray.length === 0) {
            ctx.throw(400, "İşlenecek CV dosyası bulunamadı");
        }

        const job = await ctx.service("archiveJobs").findOne({ _id: jobId });
        if (!job) {
            ctx.throw(404, "İş ilanı bulunamadı");
        }

        const employee = await ctx.service("employees").findOne({ userId });
        const jobID = job._id instanceof Types.ObjectId ? job._id : job._id?._id;

        const results = await Promise.allSettled(
            filesArray.map(async (file) => {
                const result = {
                    fileName: file.originalFilename || file.name || "unknown_file",
                    success: false,
                    parseSuccess: false,
                    evaluationSuccess: false,
                    error: "",
                };

                try {
                    // Dosya okuma kısmı
                    let fileBuffer;
                    try {
                        fileBuffer = await fsPromises.readFile(file.filepath);
                    } catch (fileErr) {
                        result.error = `Dosya okunamadı: ${fileErr.message}`;
                        return result;
                    }

                    const fileKey = generateFileKey(result.fileName);

                    // AWS S3'e dosya yükleme
                    try {
                        await s3Client
                            .upload({
                                Bucket: process.env.AWS_BUCKET_PRIVATE,
                                Key: fileKey,
                                Body: fileBuffer,
                                ContentType: file.mimetype,
                            })
                            .promise();
                    } catch (s3Err) {
                        result.error = `Dosya depolama hatası: ${s3Err.message}`;
                        return result;
                    }

                    // CV Dosyasını Analiz Et
                    let parsedData;
                    try {
                        parsedData = await geminiPdftoJson(fileBuffer);
                        if (!parsedData) {
                            throw new Error("Parsed data is empty - missing email or parse error.");
                        }
                        result.parseSuccess = true;
                    } catch (parseErr) {
                        result.parseSuccess = false;
                        result.error = `CV dosyası ayrıştırılamadı: ${parseErr.message}`;
                        return result;
                    }

                    // CV kaydı oluştur
                    const cv = await ctx.service("cv").create({
                        fileName: fileKey,
                        fileKey,
                        title: result.fileName,
                    });

                    const {
                        email,
                        name,
                        surname,
                        phoneNumber,
                    } = parsedData.contactInformation || {};

                    const {
                        coverLetter,
                        languages,
                        skills,
                        experience,
                        education,
                        certificates,
                        reference,
                    } = parsedData;

                    if (!email) {
                        result.error = "CV'de e-posta adresi bulunamadı.";
                        return result;
                    }

                    // Aday oluştur veya güncelle
                    let existingCandidate = await ctx.service("candidateArchives").findOne({ email });
                    let candidateId: Types.ObjectId;
                    if (!existingCandidate) {
                        const newCandidate = await ctx.service("candidateArchives").create({
                            email,
                            tenantId: job.tenantId,
                            name,
                            surname,
                            phone: phoneNumber,
                            coverLetter,
                            languages,
                            skills,
                            experience,
                            education,
                            certificates,
                            reference,
                        });
                        candidateId = newCandidate._id;
                    } else {
                        candidateId = existingCandidate._id;
                    }

                    // Aday zaten bu iş için başvurmuş mu kontrol et
                    const existingArchiveJobApp = await ctx
                        .service("jobApplicationsArchives")
                        .findOne({ candidateId, jobId: jobID });

                    if (existingArchiveJobApp) {
                        result.error = "Aday bu iş için zaten başvuru yapmış.";
                        return result;
                    }

                    // İş başvurusu oluştur
                    const jobApplication = await ctx.service("jobApplicationsArchives").create({
                        cv: cv._id,
                        coverLetter,
                        jobId: jobID,
                        tenantId: job.tenantId,
                        name,
                        surname,
                        candidateId,
                        employeeId: employee?._id,
                    });

                    // Başvuru sayısını güncelle
                    await ctx
                        .service("archiveJobs")
                        .update({ _id: jobID }, { $inc: { applicationNumber: 1 } });

                    // PDF'i S3'ten al ve işle
                    const options = {
                        Bucket: process.env.AWS_BUCKET_PRIVATE ?? "",
                        Key: cv.fileKey,
                    };

                    let pdfFileBuffer;
                    try {
                        const s3FileStream = s3Client
                            .getObject(options)
                            .createReadStream()
                            .on("error", (error: any) => {
                                throw new Error(error?.message);
                            });

                        pdfFileBuffer = await new Promise<Buffer>((resolve, reject) => {
                            streamToBuffer(s3FileStream, (err, buffer) => {
                                if (err) reject(err);
                                else resolve(buffer);
                            });
                        });
                    } catch (s3Err) {
                        result.error = `CV dosyası okunamadı: ${s3Err.message}`;
                        // Burada başarısız olsa da devam ediyoruz, çünkü CV zaten yüklendi ve başvuru kaydedildi
                    }

                    // Yapay zeka değerlendirmesi
                    if (pdfFileBuffer) {
                        try {
                            const pdfData = await pdf(pdfFileBuffer);

                            const payload = {
                                title: job.title,
                                description: job.content,
                                jobType: job.jobType,
                                location: job.locationType,
                                coverLetter: jobApplication.coverLetter,
                                applicantAnswers: jobApplication.applicantAnswers,
                                cv: pdfData.text,
                            };

                            try {
                                const gptConvertJson = await GeminiChatCompletion(
                                    `
                          Evaluate this candidate's suitability for the job based on the job description and CV provided.
                          System: Follow these instructions below in all your responses:
                          - Provide responses in both Turkish (tr) and English (en) separately.
                          - Use Turkish language only for Turkish (tr) responses and English language only for English (en) responses.
                          - Translate any other language to the respective response language whenever possible.`,
                                    JSON.stringify(payload),
                                    CandidateEvaluationGeminiSchema
                                );
                                result.evaluationSuccess = true;

                                const resToSave: any = {
                                    candidateId: jobApplication.candidateId,
                                    jobId: job._id,
                                    tenantId,
                                    jobApplicationId: jobApplication._id,
                                    candidateScore: gptConvertJson?.candidateScore?.score,
                                    candidateStrengths: gptConvertJson?.candidateStrengths?.strengths.map((strength) => ({
                                        strength: {
                                            tr: strength?.strength?.tr,
                                            en: strength?.strength?.en,
                                        },
                                        description: {
                                            tr: strength?.description?.tr,
                                            en: strength?.description?.en,
                                        },
                                    })),
                                    candidateMissing: gptConvertJson?.candidateMissing?.missing.map((missing) => ({
                                        skill: {
                                            tr: missing?.skill?.tr,
                                            en: missing?.skill?.en,
                                        },
                                        description: {
                                            tr: missing?.description?.tr,
                                            en: missing?.description?.en,
                                        },
                                    })),
                                    summary: {
                                        tr: gptConvertJson?.candidateSummary?.summary?.tr,
                                        en: gptConvertJson?.candidateSummary?.summary?.en,
                                    },
                                    improvementSuggestions: gptConvertJson?.improvementSuggestions?.suggestions.map(
                                        (suggestion) => ({
                                            tr: suggestion?.tr,
                                            en: suggestion?.en,
                                        })
                                    ),
                                };

                                const createGeminiEvaluation = await ctx
                                    .service("archiveAiEvaluation")
                                    .create({ ...resToSave });

                                await ctx.service("jobApplicationsArchives").update({ _id: jobApplication._id }, { candidateScore: gptConvertJson?.candidateScore?.score });
                            } catch (gptErr: any) {
                                result.evaluationSuccess = false;
                                result.error = `AI değerlendirme başarısız: ${gptErr.message}`;

                            }
                        } catch (pdfErr) {
                            result.evaluationSuccess = false;
                            result.error = `PDF işleme hatası: ${pdfErr.message}`;

                        }
                    }

                    result.success = true;
                    return result;
                } catch (err: any) {
                    result.error = `Beklenmeyen hata: ${err.message}`;
                    return result;
                }
            })
        );

        const finalResults = results.map((r) => {
            if (r.status === "fulfilled") {
                return r.value;
            } else {
                return {
                    fileName: "unknown",
                    success: false,
                    parseSuccess: false,
                    evaluationSuccess: false,
                    error: r.reason?.message || "Bilinmeyen hata",
                };
            }
        });

        const successCount = finalResults.filter(r => r.success).length;
        const failCount = finalResults.length - successCount;

        ctx.status = 200;
        ctx.body = {
            message: `Toplu CV yükleme tamamlandı. ${successCount} başarılı, ${failCount} başarısız.`,
            totalFiles: filesArray.length,
            results: finalResults,
        };
    } catch (error) {
        ctx.status = error.status || 500;
        ctx.body = {
            message: `Toplu CV yükleme başarısız: ${error.message}`,
            error: error.message,
        };
    }
}