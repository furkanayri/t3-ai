export default function jobDescription(ownjob: any) {
    let companyExpectedBehavior = "";
    ownjob?.applicantForm?.forEach((item: any, index: any) => {
        let expectedAnswer = item.options.expectedAnswer;
        if (typeof expectedAnswer === 'object' && !Array.isArray(expectedAnswer) && expectedAnswer !== null) {
            expectedAnswer = Object.entries(expectedAnswer).map(([key, value]) => `${key}: ${value}`).join(', ');
        } else if (Array.isArray(expectedAnswer)) {
            expectedAnswer = expectedAnswer.join(', ');
        }
        companyExpectedBehavior += `Firmanın soruları ${item?._id}: ${item.title}, firmanın beklediği cevaplar: ${expectedAnswer}. `;
    });
    let companyFieldsIntro = "Firma tarafından eklemesi istenilen alanlar ve zorunluluk durumları şunlardır:";
    let companyFieldsDetails = ownjob?.fields?.map((field: any, index: any) => {
        let isRequiredText = field.isRequired ? "zorunlu" : "opsiyonel";
        return ` ${index + 1}. ${field.type}: ${isRequiredText}`;
    }).join('\n');

    let companyFields = `${companyFieldsIntro}\n${companyFieldsDetails}`;
    let aiPrompt = `Bursiyer ilanı detayları: Başlık:${ownjob?.title} tanım:${ownjob?.description ?? ownjob?.seoDescription ?? "belirtilmemiştir."} kurum bilgisi ${ownjob?.content ?? "verilmemiştir."} lokasyon:${ownjob?.onsite ?? "belirtilmemiştir."} tür:${ownjob?.jobType ?? "belirtilmemiştir."} Şehir:${ownjob?.city ?? "belirtilmemiştir."} ${companyExpectedBehavior ?? "kurumun herhangi bir sorusu olmamıştır."} ${companyFields}. `;

    return aiPrompt.trim();
}