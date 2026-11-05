import * as XLSX from 'xlsx';
import { Context } from 'koa';

// Excel'den toplu soru yükleme/import
export default async function bulkImportQuestions(ctx: Context) {
    try {
        console.log('bulkImportQuestions başladı');
        console.log('ctx.request.files:', ctx.request.files);
        console.log('ctx.request.file:', ctx.request.file);
        console.log('ctx.file:', ctx.file);
        console.log('ctx.request.body:', ctx.request.body);
        
        const files = ctx.request.files;
        const file = ctx.request.file; // Multer single file
        let questions: any[] = [];

        // Excel dosyası varsa parse et  
        if (file) {
            console.log('Excel dosyası bulundu:', file.originalname);
            
            try {
                // Buffer'dan Excel dosyasını oku
                const workbook = XLSX.read(file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // JSON'a çevir
                const excelData = XLSX.utils.sheet_to_json(worksheet);
                
                // Excel verilerini quiz question formatına çevir
                questions = excelData.map((row: any) => {
                    const options = [];
                    
                    // A, B, C, D şıklarını topla
                    if (row['Şık A'] || row['Option A']) {
                        options.push({
                            text: row['Şık A'] || row['Option A'],
                            isCorrect: (row['Doğru Cevap'] || row['Correct Answer']) === 'A'
                        });
                    }
                    
                    if (row['Şık B'] || row['Option B']) {
                        options.push({
                            text: row['Şık B'] || row['Option B'],
                            isCorrect: (row['Doğru Cevap'] || row['Correct Answer']) === 'B'
                        });
                    }
                    
                    if (row['Şık C'] || row['Option C']) {
                        options.push({
                            text: row['Şık C'] || row['Option C'],
                            isCorrect: (row['Doğru Cevap'] || row['Correct Answer']) === 'C'
                        });
                    }
                    
                    if (row['Şık D'] || row['Option D']) {
                        options.push({
                            text: row['Şık D'] || row['Option D'],
                            isCorrect: (row['Doğru Cevap'] || row['Correct Answer']) === 'D'
                        });
                    }

                    if (row['Şık E'] || row['Option E']) {
                        options.push({
                            text: row['Şık E'] || row['Option E'],
                            isCorrect: (row['Doğru Cevap'] || row['Correct Answer']) === 'E'
                        });
                    }

                    return {
                        title: row['Başlık'] || row['Title'] || `Soru ${excelData.indexOf(row) + 1}`,
                        question: row['Soru'] || row['Question'],
                        description: row['Açıklama'] || row['Description'] || '',
                        options: options,
                        difficulty: (row['Zorluk'] || row['Difficulty'] || 'medium').toLowerCase(),
                        points: parseInt(row['Puan'] || row['Points']) || 10,
                        timeLimit: parseInt(row['Süre'] || row['Time Limit']) || 60,
                        explanation: row['Açıklama Text'] || row['Explanation'] || '',
                        tags: row['Etiketler'] || row['Tags'] ? 
                            (row['Etiketler'] || row['Tags']).split(',').map((tag: string) => tag.trim()) : 
                            []
                    };
                });
                
            } catch (excelError) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Excel dosyası okunamadı',
                    details: excelError.message 
                };
                return;
            }
        } 
        // JSON formatında veri gönderildiyse
        else if (ctx.request.body && ctx.request.body.questions) {
            questions = ctx.request.body.questions;
        } 
        else {
            ctx.status = 400;
            ctx.body = { 
                error: 'Excel dosyası veya geçerli bir soru dizisi gönderilmelidir',
                expectedFormat: {
                    excelColumns: {
                        turkish: ['Başlık', 'Soru', 'Şık A', 'Şık B', 'Şık C', 'Şık D', 'Doğru Cevap', 'Zorluk', 'Puan', 'Süre', 'Etiketler'],
                        english: ['Title', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Difficulty', 'Points', 'Time Limit', 'Tags']
                    }
                }
            };
            return;
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Geçerli soru bulunamadı' 
            };
            return;
        }

        const results = {
            successful: [] as any[],
            failed: [] as any[]
        };

        for (let i = 0; i < questions.length; i++) {
            const questionData = questions[i];
            
            try {
                // Validasyon
                if (!questionData.question || !questionData.options || questionData.options.length < 2) {
                    results.failed.push({
                        index: i + 1,
                        question: questionData.question || 'Boş soru',
                        error: 'Soru metni ve en az 2 şık gereklidir'
                    });
                    continue;
                }

                // Doğru cevap kontrolü
                const hasCorrectAnswer = questionData.options.some((opt: any) => opt.isCorrect === true);
                if (!hasCorrectAnswer) {
                    results.failed.push({
                        index: i + 1,
                        question: questionData.question,
                        error: 'En az bir şık doğru olarak işaretlenmelidir'
                    });
                    continue;
                }

                // Option ID'leri oluştur
                questionData.options = questionData.options.map((opt: any, idx: number) => ({
                    ...opt,
                    optionId: opt.optionId || String.fromCharCode(97 + idx)
                }));

                // Soru oluştur
                const payload = {
                    ...questionData,
                    tenantId: ctx.params.tenantId,
                    createdBy: ctx.state.user?._id,
                    isActive: true
                };

                // CategoryId'yi temizle - boş string ise undefined yap
                if (payload.categoryId === '' || payload.categoryId === null || payload.categoryId === undefined) {
                    delete payload.categoryId;
                }

                // Tags'i temizle - boş array veya undefined ise
                if (!payload.tags || (Array.isArray(payload.tags) && payload.tags.length === 0)) {
                    delete payload.tags;
                }

                // Description'ı temizle - boş string ise
                if (payload.description === '' || payload.description === null) {
                    delete payload.description;
                }

                // Explanation'ı temizle - boş string ise
                if (payload.explanation === '' || payload.explanation === null) {
                    delete payload.explanation;
                }

                // TimeLimit'i temizle - 0 veya boş ise
                if (!payload.timeLimit || payload.timeLimit <= 0) {
                    delete payload.timeLimit;
                }

                const createdQuestion = await ctx.service('quizQuestions').create(payload);
                results.successful.push({
                    index: i + 1,
                    questionId: createdQuestion._id,
                    title: createdQuestion.title
                });

            } catch (error) {
                results.failed.push({
                    index: i + 1,
                    question: questionData.question || 'Boş soru',
                    error: error.message
                });
            }
        }

        ctx.body = {
            success: true,
            data: results,
            message: `${results.successful.length} soru başarıyla oluşturuldu, ${results.failed.length} soru başarısız`
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Toplu soru yükleme sırasında bir hata oluştu',
            details: error.message 
        };
    }
}