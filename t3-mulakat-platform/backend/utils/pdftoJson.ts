import { GptChatCompletion } from './GptCompletion';
const pdf = require('pdf-parse');
import { CombinedSchema } from './pdfSchema';
export default async function pdftoJson(dataBuffer: Buffer) {

  return pdf(dataBuffer).then(async (pdfData) => {

    const gptConvertJson = await GptChatCompletion('Extract the event information.', pdfData.text, CombinedSchema)

    if (typeof gptConvertJson === 'string') {
      console.error("Beklenmeyen string formatı. JSON olması bekleniyordu.");
      throw new Error("GPT JSON verisi beklenmiyor, string döndü.");
    }
    const validationResult = CombinedSchema.safeParse(gptConvertJson);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      throw new Error("JSON verisi Zod şemasıyla uyumlu değil.");
    }
    return validationResult.data;
  }).catch(err => {
    console.error("Error processing PDF:", err);
  });

}