import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import cn from 'classnames';
import { CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useCreateUserCvMutation } from 'src/hooks/useServices/admin';

export default function CVUpload({ onUploadCompleted, userId }: { onUploadCompleted?: () => void, userId?: string }) {
  const { t } = useTranslation();
  const [isUploading, setUploading] = useState(false);
  const uploadFileMutation = useCreateUserCvMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const onDrop = (acceptedFiles: any) => {
    // Do something with the files

    const file: any = acceptedFiles?.[0];

    if (!file) return enqueueSnackbar('Not selected any file', { variant: 'error' });

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    uploadFileMutation.mutate(
      { userId: id ?? userId ?? "", payload: formData },
      {
        onSettled: () => {
          setUploading(false);
        },
        onSuccess: () => {
          onUploadCompleted?.();
          enqueueSnackbar('The file is uploaded successfully', { variant: 'success' });
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.message, { variant: 'error' });
        },
      }
    );
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed px-6 py-8 rounded-md bg-slate-100 text-center flex items-center justify-center',
        {
          'border-slate-500': isDragActive,
        }
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex items-center gap-x-2">
          <CircularProgress size={24} />
          <Typography>{t('Uploading...')}</Typography>
        </div>
      ) : isDragActive ? (
        <p>{t('Drop the files here ...')}</p>
      ) : (
        <p>{t('Drag and drop some files here, or click to select files')}</p>
      )}
    </div>
  );
}
