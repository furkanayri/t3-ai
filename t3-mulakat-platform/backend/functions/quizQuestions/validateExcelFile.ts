// Excel dosyasını validate etme
export default async function validateExcelFile(ctx: Context) {
    try {
        const files = ctx.request.files;
        
        if (!files || !files.excelFile) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Excel dosyası gönderilmelidir' 
            };
            return;
        }

        const file = Array.isArray(files.excelFile) ? files.excelFile[0] : files.excelFile;
        
        // Dosya formatı kontrolü
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        
        if (!allowedTypes.includes(file.mimetype)) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Sadece Excel dosyaları (.xlsx, .xls) kabul edilir',
                receivedType: file.mimetype
            };
            return;
        }

        // Dosya boyutu kontrolü (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Dosya boyutu 5MB\'dan büyük olamaz',
                fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
            };
            return;
        }

        try {
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile(file.filepath);
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Excel dosyasında sayfa bulunamadı' 
                };
                return;
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            if (!data || data.length === 0) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Excel dosyasında veri bulunamadı' 
                };
                return;
            }

            // Kolon kontrolü
            const firstRow = data[0] as any;
            const requiredColumns = ['Soru', 'Question']; // En az biri olmalı
            const optionColumns = ['Şık A', 'Şık B', 'Option A', 'Option B'];
            
            const hasQuestionColumn = requiredColumns.some(col => col in firstRow);
            const hasOptionColumns = optionColumns.some(col => col in firstRow);
            
            if (!hasQuestionColumn) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Excel dosyasında "Soru" veya "Question" kolonu bulunamadı',
                    foundColumns: Object.keys(firstRow)
                };
                return;
            }

            if (!hasOptionColumns) {
                ctx.status = 400;
                ctx.body = { 
                    error: 'Excel dosyasında şık kolonları bulunamadı',
                    expectedColumns: ['Şık A', 'Şık B', 'Option A', 'Option B'],
                    foundColumns: Object.keys(firstRow)
                };
                return;
            }

            // Preview için ilk 3 satırı göster
            const preview = data.slice(0, 3).map((row: any, index: number) => ({
                row: index + 1,
                question: row['Soru'] || row['Question'] || 'Boş',
                optionA: row['Şık A'] || row['Option A'] || 'Boş',
                optionB: row['Şık B'] || row['Option B'] || 'Boş',
                correctAnswer: row['Doğru Cevap'] || row['Correct Answer'] || 'Belirtilmemiş'
            }));

            ctx.body = {
                success: true,
                data: {
                    totalRows: data.length,
                    sheetName: sheetName,
                    columns: Object.keys(firstRow),
                    preview: preview
                },
                message: `Excel dosyası geçerli. ${data.length} satır veri bulundu.`
            };

        } catch (excelError) {
            ctx.status = 400;
            ctx.body = { 
                error: 'Excel dosyası okunamadı',
                details: excelError.message 
            };
        }

    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            error: 'Dosya doğrulama sırasında bir hata oluştu',
            details: error.message 
        };
    }
}