import { useSnackbar } from 'notistack';
import { ReactNode, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import cn from 'classnames';
import { usePublicUploadTenantCompanyMutation } from 'src/hooks/useServices';
import { Avatar, CircularProgress, IconButton, Typography } from '@mui/material';
import { Delete, Upload } from '@mui/icons-material';
import { ConfirmAction } from 'src/components/shared';
import { useTranslation } from 'react-i18next';


export default function LogoUpload({
    onUploadCompleted,
    onRemove,
    image,
    logoFallback
}: {
    image?: string;
    onRemove?: () => Promise<boolean>;
    onUploadCompleted?: (key?: string) => void;
    logoFallback?: ReactNode;
}) {
    const [isUploading, setUploading] = useState(false);
    const uploadFileMutation = usePublicUploadTenantCompanyMutation();
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();
    const onDrop = (acceptedFiles: any) => {
        // Do something with the files

        const file: any = acceptedFiles?.[0];

        if (!file) return enqueueSnackbar(t('Not selected any file'), { variant: 'error' });

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        uploadFileMutation.mutate(formData, {
            onSettled: () => {
                setUploading(false);
            },
            onSuccess: (response) => {
                onUploadCompleted?.(response?.key);
                enqueueSnackbar(t('The file is uploaded successfully'), { variant: 'success' });
            },
            onError: (err: any) => {
                enqueueSnackbar(err?.message, { variant: 'error' });
            },
        })
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg'],
            'image/jpg': ['.jpg'],
            'image/svg+xml': ['.svg'],
        },
        multiple: false,
        disabled: isUploading,
    });

    return (
        <div className="w-28 h-28 rounded-full group relative overflow-hidden">
            <Avatar
                src={image}
                sx={{ width: '100%', height: '100%' }}
                className={cn('border-2 border-dashed', {
                    'border-slate-500': isDragActive,
                })}
            >
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <div className="flex items-center gap-x-2">
                            <CircularProgress size={24} />
                            <Typography>Uploading...</Typography>
                        </div>
                    ) : isDragActive ? (
                        <p>Drop</p>
                    ) : (
                        <div className='group flex items-center justify-center'>
                            {logoFallback ? logoFallback : <Upload fontSize="large" />}
                            <div className='cursor-pointer hidden group-hover:flex items-center justify-center absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60'>
                                <Upload fontSize="large" sx={{ color: "white" }} />
                            </div>
                        </div>
                    )}
                </div>
            </Avatar>
            {!!image && (
                <div className="flex items-center justify-center invisible group-hover:visible absolute top-0 left-0 right-0 bottom-0 bg-slate-200 bg-opacity-70">
                    <ConfirmAction
                        onConfirm={() => {
                            return new Promise((resolve) => {
                                if (!onRemove) return resolve(false);

                                onRemove?.()
                                    .then((result) => {
                                        resolve(result);
                                    })
                                    .catch((err) => {
                                        resolve(false);
                                    });
                            });
                        }}
                    >
                        <IconButton color="error">
                            <Delete />
                        </IconButton>
                    </ConfirmAction>
                </div>
            )}
        </div>
    );
}
