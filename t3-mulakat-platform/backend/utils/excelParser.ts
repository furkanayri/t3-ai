import * as XLSX from 'xlsx';

export interface ExcelCandidate {
    firstName: string;
    lastName: string;
    identityNumber: string;
    phone: string;
    email: string;
}

export interface ParseResult {
    success: boolean;
    data: ExcelCandidate[];
    errors: string[];
}

export function parseExcelFile(buffer: Buffer): ParseResult {
    const errors: string[] = [];
    const data: ExcelCandidate[] = [];

    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            if (!row || row.length === 0 || !row[0]) {
                continue;
            }

            const candidate: ExcelCandidate = {
                firstName: row[0]?.toString().trim() || '',
                lastName: row[1]?.toString().trim() || '',
                identityNumber: row[2]?.toString().trim() || '',
                phone: row[3]?.toString().trim() || '',
                email: row[4]?.toString().trim().toLowerCase() || '',
            };

            const rowErrors: string[] = [];

            if (!candidate.firstName) rowErrors.push(`Satır ${i + 1}: Ad boş olamaz`);
            if (!candidate.lastName) rowErrors.push(`Satır ${i + 1}: Soyad boş olamaz`);
            if (!candidate.identityNumber) rowErrors.push(`Satır ${i + 1}: T.C. No boş olamaz`);
            if (candidate.identityNumber.length !== 11) rowErrors.push(`Satır ${i + 1}: T.C. No 11 haneli olmalı`);
            if (!candidate.phone) rowErrors.push(`Satır ${i + 1}: Telefon boş olamaz`);
            if (!candidate.email) rowErrors.push(`Satır ${i + 1}: Email boş olamaz`);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (candidate.email && !emailRegex.test(candidate.email)) {
                rowErrors.push(`Satır ${i + 1}: Geçersiz email formatı`);
            }

            if (rowErrors.length > 0) {
                errors.push(...rowErrors);
            } else {
                data.push(candidate);
            }
        }

        return {
            success: errors.length === 0,
            data,
            errors
        };

    } catch (error) {
        return {
            success: false,
            data: [],
            errors: [`Excel dosyası okunamadı: ${error.message}`]
        };
    }
}

export function generateTempPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}
