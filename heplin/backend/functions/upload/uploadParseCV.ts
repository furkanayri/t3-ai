import geminiPdftoJson from "@/utils/geminiPdftoJson";
import pdftoJson from "@/utils/pdftoJson";

export default async function uploadParseCV(ctx: any) {
    const fileKey = ctx.state.fileKey;
    const fileBuffer = ctx.state.fileBuffer;
    const { title } = ctx.request.body;
    const parsedData = await geminiPdftoJson(fileBuffer);
    const cv = await ctx.service("cv").create({
        fileName: fileKey,
        fileKey: fileKey,
        title: title,
    });
    ctx.state.cv = cv;



    ctx.body = {
        cvId: cv._id,
        title: cv.title,
        url: `https://your-s3-endpoint/${cv.fileKey}`,
        parsedData: parsedData
    };
}
