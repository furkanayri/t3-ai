import { GptChatCompletion } from '@/utils/GptCompletion';
import { QuestionsArraySchema } from '@/utils/testSchema';

export default async function generateQuestionsService(ctx) {
  const totalQuestionsNeeded = 50;
  const batchSize = 10;
  let allQuestions = [];
  const personalityTraits = [
    "dışadönüklük", "uyumluluk", "vicdanlılık", "duygusal kararlılık", "deneyime açıklık"
  ];

  for (let i = 0; i < totalQuestionsNeeded / batchSize; i++) {
    const trait = personalityTraits[i % personalityTraits.length];
    const prompt = `
    Lütfen **tam olarak ${batchSize} adet** kişilik testi sorusu oluştur. Her soru, '${trait}' kişilik özelliği üzerine odaklanmalıdır ve Likert tipi cevap skalası kullanılmalıdır.
    Format:
    {
      "questions": [
        {
          "question": "Soru metni",
          "options": {
            "A": "Kesinlikle katılmıyorum",
            "B": "Katılmıyorum",
            "C": "Kararsızım",
            "D": "Katılıyorum",
            "E": "Kesinlikle katılıyorum"
          },
          "trait": "${trait}"
        },
        // Diğer sorular...
      ]
    }
    **Notlar**:
    - Sadece JSON formatında yanıt ver.
    - Ek açıklama, numaralandırma veya metin ekleme.
    - Sorular ve şıklar kısa ve net olsun.
    - Tam olarak ${batchSize} soru üret.
  `;

    try {
      const response = await GptChatCompletion(
        `Tam ${batchSize} adet kişilik testi sorusu hazırla, Kişilik özelliği: '${trait}'`,
        prompt,
        QuestionsArraySchema
      );

      const validationResult = QuestionsArraySchema.safeParse(response);

      if (!validationResult.success) {
        ctx.status = 400;
        ctx.body = { message: 'Veri formatı hatalı', errors: validationResult.error };
        return;
      } else {
        allQuestions = allQuestions.concat(validationResult.data.questions);
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: 'Sorular oluşturulamadı', error: error.message };
      return;
    }
  }

  ctx.body = { questions: allQuestions };
}
