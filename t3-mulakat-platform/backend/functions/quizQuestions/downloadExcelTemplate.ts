import * as XLSX from 'xlsx';
import { Context } from 'koa';

// Excel template indirme endpoint'i
export default async function downloadExcelTemplate(ctx: Context) {
    try {
        // Örnek veri ile template oluştur
        const templateData = [
            {
                'Başlık': 'JavaScript Değişkenler',
                'Soru': 'JavaScript\'te değişken tanımlamak için hangi anahtar kelime kullanılır?',
                'Açıklama': 'Temel JavaScript değişken tanımlama sorusu',
                'Şık A': 'var',
                'Şık B': 'let',
                'Şık C': 'const',
                'Şık D': 'variable',
                'Doğru Cevap': 'A',
                'Zorluk': 'easy',
                'Puan': 10,
                'Süre': 60,
                'Etiketler': 'javascript,variables,basic',
                'Açıklama Text': 'JavaScript\'te var, let ve const anahtar kelimeleri değişken tanımlamak için kullanılır.'
            },
            {
                'Başlık': 'React Components',
                'Soru': 'React\'te functional component nasıl oluşturulur?',
                'Açıklama': 'React functional component sorusu',
                'Şık A': 'class Component extends React.Component',
                'Şık B': 'function Component() { return <div></div> }',
                'Şık C': 'const Component = React.createComponent()',
                'Şık D': 'React.component(() => {})',
                'Doğru Cevap': 'B',
                'Zorluk': 'medium',
                'Puan': 15,
                'Süre': 90,
                'Etiketler': 'react,components,frontend',
                'Açıklama Text': 'React\'te functional component, function keyword\'ü ile oluşturulur.'
            }
        ];

        // Workbook oluştur
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Questions');

        // Kolon genişliklerini ayarla
        const columnWidths = [
            { wch: 25 }, // Başlık
            { wch: 60 }, // Soru
            { wch: 30 }, // Açıklama
            { wch: 30 }, // Şık A
            { wch: 30 }, // Şık B
            { wch: 30 }, // Şık C
            { wch: 30 }, // Şık D
            { wch: 10 }, // Doğru Cevap
            { wch: 10 }, // Zorluk
            { wch: 8 },  // Puan
            { wch: 8 },  // Süre
            { wch: 25 }, // Etiketler
            { wch: 50 }  // Açıklama Text
        ];
        worksheet['!cols'] = columnWidths;

        // Buffer oluştur
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Response headers
        ctx.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="quiz-questions-template.xlsx"',
            'Content-Length': buffer.length.toString()
        });

        ctx.status = 200;
        ctx.body = buffer;
    } catch (error) {
        console.error('Excel template oluşturma hatası:', error);
        ctx.status = 500;
        ctx.body = { 
            error: 'Template oluşturulurken bir hata oluştu',
            details: error.message,
            stack: error.stack
        };
    }
}