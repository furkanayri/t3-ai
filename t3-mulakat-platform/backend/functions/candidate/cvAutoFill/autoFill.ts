import geminiPdftoJson from "@/utils/geminiPdftoJson";
import { Types } from "mongoose";

function normalizeDate(dateStr) {
  if (!dateStr) return undefined;

  const mmyyyyRegex = /^(\d{1,2})\/(\d{4})$/;
  if (typeof dateStr === 'string' && mmyyyyRegex.test(dateStr)) {
    const [, month, year] = mmyyyyRegex.exec(dateStr);
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  }

  const parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  return undefined;
}



export default async function autoFill(ctx: Context) {
  const { fileKey } = ctx.params;
  const fileStream = ctx.state.fileBuffer;
  const user = ctx.state.user;
  try {
    const pdfData = await geminiPdftoJson(fileStream);

    const cvId = await ctx
      .service("cv")
      .findOne({ fileKey: fileKey, userId: user._id });

    if (!cvId?._id || (typeof cvId?._id !== 'string' && !(cvId?._id instanceof Types.ObjectId)))
      ctx.throw(404, "Cv not found");

    const processedExperience = pdfData.experience?.map(exp => ({
      ...exp,
      startDate: normalizeDate(exp.startDate),
      endDate: exp.isOngoing ? undefined : normalizeDate(exp.endDate)
    })) || [];

    const processedEducation = pdfData.education?.map(edu => ({
      ...edu,
      startDate: normalizeDate(edu.startDate),
      endDate: edu.isOngoing ? undefined : normalizeDate(edu.endDate)
    })) || [];

    const processedCertificates = pdfData.certificates?.map(cert => ({
      ...cert,
      startDate: normalizeDate(cert.startDate),
      endDate: normalizeDate(cert.endDate)
    })) || [];





    const newData: any = {
      userId: ctx.state.user._id,
      cvId: cvId._id,
      experience: processedExperience,
      education: processedEducation,
      certificates: processedCertificates,
      languages: pdfData.languages || [],
      skills: pdfData.skills || [],
      contactInformation: pdfData.contactInformation || {},
      reference: pdfData.reference || [],
      coverLetter: pdfData.coverLetter || "",
    };


    const exsistCv = await ctx
      .service("candidateCv")
      .findOne({ userId: ctx.state.user._id });

    if (exsistCv) {
      await ctx
        .service("candidateCv")
        .update((exsistCv?._id ?? "") as any, newData);

      await ctx.service("candidateExperiences").deleteMany(ctx.state.user._id);
      await ctx.service("candidateEducations").deleteMany(ctx.state.user._id);
      await ctx.service("candidateCertificates").deleteMany(ctx.state.user._id);
      await ctx.service("candidateLanguages").deleteMany(ctx.state.user._id);
      ctx.state.cvId = exsistCv._id;
      return;
    }

    const data = await ctx.service("candidateCv").create(newData);

    ctx.state.cvId = data._id;
    ctx.body = 'test'
  } catch (error) {
    console.error("autoFill function error:", error);
    ctx.throw(500, "CV işleme sırasında bir hata oluştu.");
  }
}