import { DownloadForOffline } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { MouseEventHandler, useState } from 'react';
import { readFileService } from 'src/services';

export default function DownloadFile({ fileKey }: { fileKey: string }) {
  const [downloading, setDownloading] = useState(false);
  const downloadFile: MouseEventHandler<HTMLButtonElement> = async (e) => {
    try {
      e.stopPropagation();
      setDownloading(true);
      const blob = await readFileService({ fileKey });

      const url = window.URL.createObjectURL(new Blob([blob]));

      const link = document.createElement('a');
      link.href = url;
      link.download = fileKey;

      document.body.appendChild(link);

      link.click();

      link?.parentNode?.removeChild(link);
    } catch (error: any) {

    } finally {
      setDownloading(false);
    }
  };
  return (
    <IconButton
      size="small"
      onClick={downloadFile}
      disabled={downloading}
    >
      <DownloadForOffline />
    </IconButton>
  );
}
