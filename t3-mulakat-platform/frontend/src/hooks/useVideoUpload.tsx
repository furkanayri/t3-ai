import React, { useState } from 'react';
import { LinearProgress, Typography, Box } from '@mui/material';
import { useGeneratePresignedUrlMutation } from './useServices/useInterviewServices';

interface UploadProgressProps {
    onUploadComplete?: (fileKey: string) => void;
    onError?: (error: string) => void;
}

export const useVideoUpload = ({
    onUploadComplete,
    onError
}: UploadProgressProps = {}) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<
        'idle' | 'generating-url' | 'uploading' | 'complete' | 'error'
    >('idle');
    const [error, setError] = useState<string | null>(null);

    const generatePresignedUrlMutation = useGeneratePresignedUrlMutation();

    const uploadVideo = async (videoBlob: Blob, questionId: string, fileName: string) => {
        try {
            setError(null);
            setUploadStatus('generating-url');
            setUploadProgress(0);

            const detectedContentType = videoBlob.type || 'video/webm';

            const response = await generatePresignedUrlMutation.mutateAsync({
                fileName,
                contentType: detectedContentType,
                questionId
            });

            const { presignedUrl, fileKey, contentType: responseContentType } = response;

            setUploadStatus('uploading');

            try {
                const uploadResponse = await fetch(presignedUrl, {
                    method: 'PUT',
                    body: videoBlob,
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
                }

                setUploadProgress(100);

            } catch (fetchError) {
                console.error('Upload error:', fetchError);
                throw fetchError;
            }

            setUploadStatus('complete');
            onUploadComplete?.(fileKey);

            return { fileKey };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setUploadStatus('error');
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    };

    const reset = () => {
        setUploadProgress(0);
        setUploadStatus('idle');
        setError(null);
    };

    return {
        uploadVideo,
        uploadProgress,
        uploadStatus,
        error,
        isLoading: generatePresignedUrlMutation.isLoading,
        reset
    };
};

export const VideoUploadProgress: React.FC<{
    progress: number;
    status: string;
}> = ({ progress, status }) => {
    const getStatusText = () => {
        switch (status) {
            case 'generating-url':
                return 'URL oluşturuluyor...';
            case 'uploading':
                return `Yükleniyor... ${progress}%`;
            case 'complete':
                return 'Video yüklendi!';
            case 'error':
                return 'Hata oluştu';
            default:
                return 'Bekliyor...';
        }
    };

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
                {getStatusText()}
            </Typography>
            {(status === 'uploading' || status === 'generating-url') && (
                <LinearProgress
                    variant={status === 'uploading' ? 'determinate' : 'indeterminate'}
                    value={progress}
                />
            )}
        </Box>
    );
};