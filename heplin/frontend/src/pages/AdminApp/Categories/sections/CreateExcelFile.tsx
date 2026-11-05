import React from 'react';
import ExcelJS from 'exceljs';
import { t } from 'i18next';

interface Job {
    title: string;
    categoryId: {
        name: string;
    };
    tenantId: {
        name: string;
        phone: string;
        address: string;
    };
}

interface ExportExcelButtonProps {
    jobs: Job[];
}

const ExportExcelButton = ({ jobs }: ExportExcelButtonProps) => {
    const handleCreateExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Jobs');

        worksheet.columns = [
            { header: 'Job Title', key: 'title', width: 35 },
            { header: 'Category', key: 'category', width: 35 },
            { header: 'Company Name', key: 'companyName', width: 30 },
            { header: 'Tenant Phone', key: 'tenantPhone', width: 30 },
            { header: 'Tenant Address', key: 'tenantAddress', width: 55 },
        ];
        worksheet.columns.forEach(column => {
            column.style = {
                alignment: { vertical: 'middle', horizontal: 'center' },
            };
        });

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF36CBFF' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        jobs.forEach((job) => {
            worksheet.addRow({
                title: job.title,
                category: job.categoryId?.name,
                companyName: job.tenantId?.name,
                tenantPhone: job.tenantId?.phone,
                tenantAddress: job.tenantId?.address,
            }).eachCell((cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = jobs.length > 0 ? `${jobs[0]?.categoryId?.name}.xlsx` : 'jobs.xlsx';
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
    };

    return <button onClick={handleCreateExcel}>{t('createExcel')}</button>;
};

export default ExportExcelButton;