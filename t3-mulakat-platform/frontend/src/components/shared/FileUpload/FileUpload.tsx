import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import cn from 'classnames';
import { usePrivateFileUploadMutation } from 'src/hooks/useServices';
import { CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function FileUpload({ onUploadCompleted }: { onUploadCompleted?: (key: string) => void }) {
  const { t } = useTranslation();
  const [isUploading, setUploading] = useState(false);
  const uploadFileMutation = usePrivateFileUploadMutation();
  const { enqueueSnackbar } = useSnackbar();
  const onDrop = (acceptedFiles: any) => {
    // Do something with the files

    const file: any = acceptedFiles?.[0];

    if (!file) return enqueueSnackbar(t('Not selected any file'), { variant: 'error' });

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    uploadFileMutation.mutate(
      formData,
      {
        onSettled: () => {
          setUploading(false);
        },
        onSuccess: (res) => {
          onUploadCompleted?.(res?.key);
          enqueueSnackbar(t('The file is uploaded successfully'), { variant: 'success' });
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.message, { variant: 'error' });
        },
      }
    );
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
