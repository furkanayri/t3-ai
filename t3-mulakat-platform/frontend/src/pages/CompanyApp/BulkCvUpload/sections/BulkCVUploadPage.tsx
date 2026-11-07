import React, { useState, useCallback, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { useDropzone } from 'react-dropzone';
import { useSearchParams } from 'react-router-dom';
import { Seo } from 'src/components/seo';
import { useGetArchiveJobsQuery, usePostBulkCvUpload } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { JobPost } from 'src/types/jobPost';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/providers';
import CircularProgress from '@mui/material/CircularProgress';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const BATCH_SIZE = 20; // Her seferde işlenecek CV sayısı

export function BulkCvUploadPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [selectedJob, setSelectedJob] = useState<string>('');
    const [currentTab, setCurrentTab] = useState<'published' | 'pending' | 'closed'>('published');
    const { t } = useTranslation();
    const { user } = useAuth();
    const [uploadStatuses, setUploadStatuses] = useState<Record<string, 'success' | 'error' | 'pending'>>({});
    const [isFilesUpdated, setIsFilesUpdated] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processingBatch, setProcessingBatch] = useState<number>(0);
    const [totalBatches, setTotalBatches] = useState<number>(0);
    const [processedCount, setProcessedCount] = useState<number>(0);

    const pageSizes = [12, 25, 50];
    const [searchParams] = useSearchParams();
    const page = useMemo(() => Number(searchParams.get('page')), [searchParams]) || 0;
    const limit = useMemo(() => Number(searchParams.get('limit')), [searchParams]) || pageSizes[0];
    const query = useMemo(
        () => `status=${currentTab}&page=${page + 1}&limit=${limit}`,
        [page, limit, currentTab]
    );

    const jobsQuery = useGetArchiveJobsQuery(query);
    const jobsData = array<JobPost>(jobsQuery.data?.results);

    const bulkCvUploadMutation = usePostBulkCvUpload();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const mappedFiles = acceptedFiles.map((file) =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
        );
        setFiles((prev) => [...prev, ...mappedFiles]);
        setIsFilesUpdated(true);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'text/plain': ['.txt'],
        },
        multiple: true,
    });

    const removeFile = (file: File) => {
        setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    };


    const calculateProgress = useMemo(() => {
        if (totalBatches === 0) return 0;
        return Math.round((processingBatch / totalBatches) * 100);
    }, [processingBatch, totalBatches]);

    const processBatch = async (batchFiles: File[], batchIndex: number, totalBatches: number) => {
        const formData = new FormData();
        formData.append('jobId', selectedJob);
        formData.append('userId', user?._id || '');

        batchFiles.forEach((file, index) => {
            formData.append(`files[${index}][title]`, file.name);
            formData.append(`files[${index}][file]`, file);


            setUploadStatuses((prev) => ({
                ...prev,
                [file.name]: 'pending'
            }));
        });

        try {
            const data = await bulkCvUploadMutation.mutateAsync(formData);

            data.results.forEach((result: any) => {
                setUploadStatuses((prev) => ({
                    ...prev,
                    [result.fileName]: result.success ? 'success' : 'error',
                }));
            });


            setProcessedCount(prev => prev + batchFiles.length);


            const successCount = data.results.filter((r: any) => r.success).length;
            const errorCount = data.results.filter((r: any) => !r.success).length;




            return {
                successCount,
                errorCount
            };
        } catch (err: any) {

            batchFiles.forEach(file => {
                setUploadStatuses((prev) => ({
                    ...prev,
                    [file.name]: 'error',
                }));
            });

            // enqueueSnackbar(
            //     t(err?.response?.data?.message || `Batch ${batchIndex + 1} yüklenirken hata oluştu.`),
            //     { variant: 'error', persist: false, autoHideDuration: 5000 }
            // );

            return {
                successCount: 0,
                errorCount: batchFiles.length
            };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedJob || files.length === 0) return;

        setIsProcessing(true);


        const batches: File[][] = [];
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            batches.push(files.slice(i, i + BATCH_SIZE));
        }

        setTotalBatches(batches.length);
        setProcessedCount(0);


        enqueueSnackbar(
            t('Total {{files}} CVs will be processed in {{batches}} batches.', {
                files: files.length,
                batches: batches.length
            }),
            { variant: 'info', autoHideDuration: 5000 }
        );

        let totalSuccessCount = 0;
        let totalErrorCount = 0;


        for (let i = 0; i < batches.length; i++) {
            setProcessingBatch(i + 1);




            const batchResult = await processBatch(batches[i], i, batches.length);
            totalSuccessCount += batchResult.successCount;
            totalErrorCount += batchResult.errorCount;


            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }


        enqueueSnackbar(
            t('Bulk CV upload completed. Total {{totalSuccessCount}} CVs processed successfully, {{totalErrorCount}} CVs failed.', {
                totalSuccessCount,
                totalErrorCount
            }),
            { variant: totalErrorCount === 0 ? 'success' : 'info', autoHideDuration: 5000 }
        );

        setIsProcessing(false);
        setIsFilesUpdated(false);
    };

    return (
        <>
            <Seo title="Toplu CV Yükleme" />
            {isProcessing && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 z-50">
                    <CircularProgress size={80} className="mb-4" />
                    <Typography variant="h6" className="text-xl text-gray-700 mb-2">
                        {t("Processing CVs...")}
                    </Typography>
                    <Box sx={{ width: '80%', maxWidth: '500px', mb: 2 }}>
                        <LinearProgress variant="determinate" value={calculateProgress} />
                    </Box>
                    <Typography variant="body1" className="text-gray-600">
                        {t('Batch {{processingBatch}}/{{totalBatches}} ({{processedCount}} / {{files}} CVs processed)', {
                            processingBatch,
                            totalBatches,
                            processedCount,
                            files: files.length
                        })}
                    </Typography>
                </div>
            )}
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3">
                        {t('BulkCVUpload')}
                    </h1>
                    <p className="text-gray-600 text-lg">Toplu CV yükleme ve değerlendirme sistemi</p>
                </div>
                <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl shadow-xl p-8 space-y-8 border border-red-100"
                    style={{
                        boxShadow: '0 20px 50px rgba(239, 68, 68, 0.1)'
                    }}
                >
                    <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{t('ArchiveJobs')}</h3>
                                <p className="text-sm text-gray-600">CV'lerin yükleneceği arşiv işi seçin</p>
                            </div>
                        </div>
                        <select
                            id="job-select"
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="block w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                            disabled={jobsQuery.isLoading || isProcessing}
                        >
                            <option value="">{t('SelectArchiveJob')}</option>
                            {jobsData.map((job) => (
                                <option key={job._id} value={job._id}>
                                    {job.title}
                                </option>
                            ))}
                        </select>
                        {jobsQuery.isLoading && (
                            <div className="flex items-center gap-2 mt-3 text-blue-600">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm">{t('JobPostLoading')}</p>
                            </div>
                        )}
                        {jobsQuery.isError && (
                            <div className="flex items-center gap-2 mt-3 text-red-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm">{t('AnErrorOccurredLoadingJobs')}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">CV Dosyalarını Yükle</h3>
                                <p className="text-sm text-gray-600">PDF, DOC, DOCX veya TXT formatında CV'leri seçin</p>
                            </div>
                        </div>

                        <div
                            {...getRootProps()}
                            className={clsx(
                                'relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300',
                                {
                                    'border-red-400 bg-red-50 shadow-lg': isDragActive,
                                    'border-gray-300 bg-gray-50 hover:bg-red-50/30 hover:border-red-300': !isDragActive,
                                    'opacity-50 cursor-not-allowed': isProcessing
                                }
                            )}
                        >
                            <input {...getInputProps()} disabled={isProcessing} />
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                {isDragActive ? (
                                    <div>
                                        <p className="text-red-600 text-lg font-medium mb-2">{t('DropFilesHere')}</p>
                                        <p className="text-red-500 text-sm">Dosyaları buraya bırakın</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-700 text-lg font-medium mb-2">{t('DragDropCVFiles')}</p>
                                        <p className="text-gray-500 text-sm mb-4">ya da dosyaları seçmek için tıklayın</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className={clsx("mt-6 px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg transition-all duration-200", {
                                        "hover:from-red-600 hover:to-red-700 hover:shadow-xl transform hover:-translate-y-0.5": !isProcessing,
                                        "opacity-50 cursor-not-allowed": isProcessing
                                    })}
                                    disabled={isProcessing}
                                >
                                    {t('SelectFiles')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 5a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V5zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {t('SelectedFiles')} ({files.length})
                                    </h2>
                                    <p className="text-sm text-gray-600">Seçilen CV dosyalarını kontrol edin ve yükleyin</p>
                                </div>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {files.map((file, index) => {
                                    const status = uploadStatuses[file.name];
                                    return (
                                        <li key={index} className="relative bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                                            <div className="flex flex-col">
                                                {/* Dosya bilgisi ve simgesi */}
                                                <div className="flex items-start mb-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                                        <FileCopyIcon className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0 flex-grow">
                                                        <p className="text-sm font-semibold text-gray-800 break-all mb-1">{file.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {(file.size / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* İşlemler satırı */}
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(file)}
                                                        className="text-red-600 hover:bg-red-50 text-xs px-3 py-1.5 border border-red-200 rounded-lg transition-all duration-200 hover:border-red-300 font-medium"
                                                        disabled={isProcessing}
                                                    >
                                                        {t('Remove')}
                                                    </button>
                                                </div>
                                            </div>
                                            {status && (
                                                <div className="absolute top-2 right-2">
                                                    {status === 'success' ? (
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    ) : status === 'error' ? (
                                                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    ) : status === 'pending' && (
                                                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {(files.length > 0 || selectedJob) && (
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        {files.length > 0 && (
                                            <p className="text-red-800 font-semibold">
                                                {t("total")} {files.length} CV seçildi
                                            </p>
                                        )}
                                        {selectedJob && (
                                            <p className="text-red-600 text-sm">
                                                Arşiv işi seçildi - Yüklemeye hazır
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={
                                        isProcessing ||
                                        files.length === 0 ||
                                        !selectedJob ||
                                        !isFilesUpdated
                                    }
                                    className={clsx('px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg', {
                                        'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-xl transform hover:-translate-y-0.5':
                                            files.length > 0 && selectedJob && !isProcessing && isFilesUpdated,
                                        'bg-gray-400 cursor-not-allowed':
                                            files.length === 0 || !selectedJob || isProcessing || !isFilesUpdated,
                                    })}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t('Uploading...')}
                                        </div>
                                    ) : (
                                        t('UploadCVs')
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

BulkCvUploadPage.displayName = 'BulkCvUploadPage';
