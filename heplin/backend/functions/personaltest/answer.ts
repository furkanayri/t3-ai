import { GeminiChatCompletion } from '@/utils/GeminiChatCompletion';
import { geminiPersonalityEvaluationSchema } from '@/utils/geminiPersonalityEvaluationSchema';
import { PersonalityEvaluationSchema } from "@/utils/personalityEvaluationSchema";

export default async function createPersonalityEvaluation(ctx: Context) {
  const { answers, userId } = ctx.request.body;

  if (!Array.isArray(answers)) {
    return ctx.throw(400, {
      error_code: "INVALID_INPUT_FORMAT",
      message: "answers bir dizi (array) olmalıdır.",
    });
  }

  const scores = evaluatePersonality(answers);

  const prompt = `
    Aşağıdaki adayın verdiği cevapları değerlendir:
    Cevaplar: ${JSON.stringify(answers)}
    Kişilik özellikleri hakkında detaylı bir analiz yapın ve her bir özellik için 1'den 10'a kadar puan verin.
    Ayrıca adayın güçlü ve zayıf yönlerini belirtin.
    Yanıtı **JSON formatında** aşağıdaki gibi ver:

    {
      "perfectionism": { "score": <1-10 arası bir sayı> },
      "ambition": { "score": <1-10 arası bir sayı> },
      "motivation": { "score": <1-10 arası bir sayı> },
      "desireForLeadership": { "score": <1-10 arası bir sayı> },
      "strengths": [<güçlü yönler listesi>],
      "weaknesses": [<zayıf yönler listesi>]
    }
  `;

  const aiResponse = await GeminiChatCompletion('Cevapları Değerlendir', prompt, geminiPersonalityEvaluationSchema);
  const validationResult = PersonalityEvaluationSchema.safeParse(aiResponse);
  if (!validationResult.success) {
    return ctx.throw(400, "AI yanıtı beklenen formatta değil");
  }

  const evaluation = validationResult.data;
  ctx.body = { isSuccess: true, evaluation };


  try {
    const newTestResult = await ctx.service("personalityTestResult").create({
      userId,
      perfectionism: evaluation.perfectionism.score,
      ambition: evaluation.ambition.score,
      motivation: evaluation.motivation.score,
      desireForLeadership: evaluation.desireForLeadership.score,
      strengths: {
        tr: Array.isArray(evaluation.strengths.tr) ? evaluation.strengths.tr : [evaluation.strengths.tr],
        en: Array.isArray(evaluation.strengths.en) ? evaluation.strengths.en : [evaluation.strengths.en],
      },
      weaknesses: {
        tr: Array.isArray(evaluation.weaknesses.tr) ? evaluation.weaknesses.tr : [evaluation.weaknesses.tr],
        en: Array.isArray(evaluation.weaknesses.en) ? evaluation.weaknesses.en : [evaluation.weaknesses.en],
      },
    });

    const user = await ctx.service("users").update(userId, { isPersonaltyTest: true });

    ctx.body = { isSuccess: true, data: newTestResult };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'Değerlendirme sonuçları veritabanına kaydedilemedi', error: error.message };
  }
}

export function evaluatePersonality(answers) {
  let scores = {
    dışadönüklük: 0,
    uyumluluk: 0,
    vicdanlılık: 0,
    duygusal_kararlılık: 0,
    deneyime_açıklık: 0,
  };

  answers.forEach(answer => {
    const { trait, optionText, questionText } = answer;

    const optionScore = mapOptionToScore(optionText);
    scores[trait] += optionScore;
  });

  return scores;
}

function mapOptionToScore(optionText: string): number {
  switch (optionText) {
    case 'Kesinlikle katılmıyorum':
      return 1;
    case 'Katılmıyorum':
      return 2;
    case 'Kararsızım':
      return 3;
    case 'Katılıyorum':
      return 4;
    case 'Kesinlikle katılıyorum':
      return 5;
    default:
      return 0;
  }
}

