import { Worker, Viewer } from '@react-pdf-viewer/core';
import store from 'store';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useTranslation } from 'react-i18next';

type PdfError = {
  name: string,
  message: string
}
export default function PDFViewer({ fileUrl }: { fileUrl: string }) {
  const { t } = useTranslation()
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
      <div
        style={{
          border: '1px solid rgba(0, 0, 0, 0.3)',
          height: '750px',
        }}
      >
        <Viewer
          fileUrl={fileUrl}
          renderError={(e: any) => {
            const errorMessageKey = e?.name || 'defaultError';
            return (
              <div className='flex items-center justify-center h-full'>
                <p >
                  {t(errorMessageKey)}
                </p>
              </div>
            )
          }}
          // withCredentials={true}
          httpHeaders={{
            Authorization: `Bearer ${store.get('token')}`
          }}
        />
      </div>
    </Worker>
  );
}
