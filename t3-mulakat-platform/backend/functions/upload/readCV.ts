import { s3Client } from "@/utils";

export default async function readCV(ctx: Context) {
  const { cvId } = ctx.params;

  const cvFile = await ctx.service("cv").findOne({ _id: cvId });

  if (!cvFile) return ctx.throw(404, "CV not found");

  const options = {
    Bucket: process.env.AWS_BUCKET_PRIVATE ?? "",
    Key: cvFile.fileKey,
  };

  try {
    const s3Stream = s3Client.getObject(options).createReadStream();

    s3Stream.on("error", (err) => {
      console.error("S3 stream error:", err);
      ctx.status = 500;
      ctx.body = { success: false, message: "Dosya okunamadı", error: err.message };
    });

    ctx.set("Content-Type", "application/pdf");
    ctx.set("Content-Disposition", `inline; filename="${cvFile.fileName}"`);
    ctx.attachment(cvFile.fileName);
    ctx.body = s3Stream;

  } catch (err: any) {
    console.error("S3 getObject error:", err);
    ctx.throw(500, "S3 erişimi başarısız: " + err.message);
  }
}
