import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { useAutoFillMutation } from 'src/hooks/useServices'

function CvAutoFillDialog({ open, onClose, data }: { open: boolean, onClose: any, data: any }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const autoFillMutation = useAutoFillMutation()
    const handleClick = () => {
        autoFillMutation.mutateAsync(
            data?.fileKey, {
            onSuccess(data, variables, context) {
                queryClient.refetchQueries()
                enqueueSnackbar(t('Auto Fill Success'), { variant: 'success' });
                onClose()
            },
            onError(error, variables, context) {
                enqueueSnackbar(t('Auto fill Error'), { variant: 'error' });

            },
        }
        )
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle> {t('autoFillMessage', { fileName: data?.title })} </DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    {t('autoFillDescription')}
                </Typography>
            </DialogContent>
            <Button onClick={() => handleClick()}>
                {
                    autoFillMutation.isLoading ? <CircularProgress size={20} /> :
                        t('autofill')
                }
            </Button>
        </Dialog>
    )
}

export default CvAutoFillDialog