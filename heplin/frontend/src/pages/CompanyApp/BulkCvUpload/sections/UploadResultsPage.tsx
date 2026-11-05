import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface UploadResult {
    fileName: string;
    success: boolean;
    parseSuccess: boolean;
    evaluationSuccess: boolean;
    error: string;
}

export interface UploadResultsProps {
    results: UploadResult[];
    totalFiles: number;
}

export const UploadResultsPage = ({ results, totalFiles }: UploadResultsProps) => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

    const filteredResults = React.useMemo(() => {
        if (filter === 'all') return results;
        return results.filter(result => filter === 'success' ? result.success : !result.success);
    }, [results, filter]);

    const successCount = results.filter(r => r.success).length;
    const failureCount = totalFiles - successCount;
    const parseFailCount = results.filter(r => !r.parseSuccess).length;
    const evaluationFailCount = results.filter(r => r.parseSuccess && !r.evaluationSuccess).length;
    const duplicateCount = results.filter(r => r.error.includes("already applied")).length;

    // Hata türlerini gruplayalım
    const errorCategories = React.useMemo(() => {
        const categories: Record<string, number> = {};
        results.filter(r => !r.success).forEach(r => {
            let category = 'Diğer';
            if (!r.parseSuccess) {
                category = 'Parse Hatası';
            } else if (r.error.includes('Email is missing')) {
                category = 'Email Eksik';
            } else if (r.error.includes('already applied')) {
                category = 'Tekrarlanan Başvuru';
            } else if (!r.evaluationSuccess) {
                category = 'AI Değerlendirme Hatası';
            }

            categories[category] = (categories[category] || 0) + 1;
        });
        return categories;
    }, [results]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#E31E24', fontWeight: 'medium' }}>
                {t('Upload Results Summary')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                    label={`${t('All')} (${totalFiles})`}
                    onClick={() => setFilter('all')}
                    color={filter === 'all' ? 'primary' : 'default'}
                />
                <Chip
                    label={`${t('Success')} (${successCount})`}
                    onClick={() => setFilter('success')}
                    color={filter === 'success' ? 'success' : 'default'}
                    icon={<CheckCircleIcon />}
                />
                <Chip
                    label={`${t('Failed')} (${failureCount})`}
                    onClick={() => setFilter('failed')}
                    color={filter === 'failed' ? 'error' : 'default'}
                    icon={<ErrorIcon />}
                />
            </Box>

            {/* İstatistikler */}
            <Box sx={{ mb: 3 }}>
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">{t('İşlem Özeti')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Paper elevation={1} sx={{ p: 2, minWidth: '180px', flex: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Toplam CV')}
                                </Typography>
                                <Typography variant="h6">
                                    {totalFiles}
                                </Typography>
                            </Paper>
                            <Paper elevation={1} sx={{ p: 2, minWidth: '180px', flex: 1, bgcolor: 'success.light' }}>
                                <Typography variant="body2" color="white">
                                    {t('Başarılı')}
                                </Typography>
                                <Typography variant="h6" color="white">
                                    {successCount} ({Math.round(successCount / totalFiles * 100)}%)
                                </Typography>
                            </Paper>
                            <Paper elevation={1} sx={{ p: 2, minWidth: '180px', flex: 1, bgcolor: 'error.light' }}>
                                <Typography variant="body2" color="white">
                                    {t('Başarısız')}
                                </Typography>
                                <Typography variant="h6" color="white">
                                    {failureCount} ({Math.round(failureCount / totalFiles * 100)}%)
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Hata türleri */}
                        {failureCount > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    {t('Hata Türleri')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    {Object.entries(errorCategories).map(([category, count]) => (
                                        <Chip
                                            key={category}
                                            label={`${t(category)}: ${count}`}
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                            sx={{ mb: 1 }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Dosya Adı')}</TableCell>
                            <TableCell align="center">{t('Durum')}</TableCell>
                            <TableCell align="center">{t('Parse')}</TableCell>
                            <TableCell align="center">{t('AI Değerlendirme')}</TableCell>
                            <TableCell>{t('Hata Detayı')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredResults.map((result, index) => (
                            <TableRow key={index} sx={{
                                bgcolor: result.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                '&:hover': { bgcolor: result.success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)' }
                            }}>
                                <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {result.fileName || 'İsimsiz Dosya'}
                                </TableCell>
                                <TableCell align="center">
                                    {result.success ? (
                                        <Chip size="small" color="success" label={t('Başarılı')} />
                                    ) : (
                                        <Chip size="small" color="error" label={t('Başarısız')} />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {result.parseSuccess ? (
                                        <CheckCircleIcon color="success" fontSize="small" />
                                    ) : (
                                        <ErrorIcon color="error" fontSize="small" />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {!result.parseSuccess ? (
                                        <CircularProgress size={16} />
                                    ) : result.evaluationSuccess ? (
                                        <CheckCircleIcon color="success" fontSize="small" />
                                    ) : (
                                        <ErrorIcon color="error" fontSize="small" />
                                    )}
                                </TableCell>
                                <TableCell sx={{ maxWidth: '300px' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        maxHeight: '40px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}>
                                        {result.error || (result.success ? t('İşlem başarılı') : t('Bilinmeyen hata'))}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
