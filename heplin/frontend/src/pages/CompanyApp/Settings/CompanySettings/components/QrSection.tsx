import {
    Button,
    IconButton,
} from '@mui/material';
import { useTenantQrMutation, } from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';
import { InboxDownloadIcon, PrinterIcon, QrCodeIcon } from 'hugeicons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const QrSection = ({ refetch, tenantInfo }: { refetch: any, tenantInfo: any }) => {
    const qrMutation = useTenantQrMutation()
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();

    const handleDownloadQRCode = () => {
        if (tenantInfo?.tenantQr) {
            const a = document.createElement('a');
            const svgBlob = new Blob([tenantInfo?.tenantQr], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            a.href = svgUrl;
            a.download = 'qr-code.svg';
            a.click();
        }
    };
    const handleClick = () => {
        // create Qr
        qrMutation.mutateAsync({
            payload: {
                url: `${window.location.origin}/tr/${tenantInfo?.subdomain}`
            }
        },
            {
                onSuccess(data, variables, context) {
                    enqueueSnackbar(t('qrCreated'), {
                        variant: 'success',
                    });
                    refetch()
                },
                onError(error, variables, context) {
                    enqueueSnackbar(t('qrError'), {
                        variant: 'error',
                    });
                }

            }

        )
    }
    const handlePrintQRCode = () => {
        if (tenantInfo?.tenantQr) {
            const printWindow = window.open('', '_blank');

            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <style>
                                body {
                                    text-align: center;
                                    padding: 20px;
                                }
                                img {
                                    max-width: 100%;
                                    height: auto;
                                }
                            </style>
                        </head>
                        <body>
                            ${tenantInfo?.tenantQr} 
                        </body>
                    </html>
                `);

                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        } else {
            enqueueSnackbar(t('qrNotFound'), {
                variant: 'error',
            });
        }
    };
    return (
        <div className="w-full max-w-4xl pt-12 py-12 px-12 mt-[42px]">

            <div
                className='px-[40px] py-[48px]'
                style={{
                    boxShadow: '0px 4px 14.8px 0px #A6A6A640'
                }}
            >
                <div className='flex justify-end items-center  gap-4 '>
                    <Link className='text-xl' to={window.location.origin + '/tr/' + tenantInfo.subdomain} target='_blank' style={{ textDecoration: 'none' }}>
                        <Button variant="contained" color="primary">
                            {t('careerPage')}
                        </Button>
                    </Link>

                    {!tenantInfo?.tenantQr &&
                        <div className='relative w-[200px] animate-bounce flex justify-center items-center '>
                            <IconButton onClick={() => handleClick()}>
                                <QrCodeIcon
                                    size={24}
                                    color={"#000000"}
                                />
                            </IconButton>
                            <p className='absolute -bottom-5'>{t('qrCreate')}</p>
                        </div>
                    }

                    {
                        tenantInfo?.tenantQr &&
                        <>
                            < IconButton onClick={() => handleDownloadQRCode()}>
                                <InboxDownloadIcon
                                    size={24}
                                    color={"#000000"}
                                />
                            </IconButton>
                            < IconButton onClick={() => handlePrintQRCode()}>
                                <PrinterIcon
                                    size={24}
                                    color={"#000000"}
                                />
                            </IconButton>
                        </>

                    }



                </div>
                <div className='max-w-md mx-auto mt-5 flex items-center justify-center'>
                    {tenantInfo?.tenantQr && (
                        <div className='w-[325px]' dangerouslySetInnerHTML={{ __html: tenantInfo?.tenantQr }} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default QrSection