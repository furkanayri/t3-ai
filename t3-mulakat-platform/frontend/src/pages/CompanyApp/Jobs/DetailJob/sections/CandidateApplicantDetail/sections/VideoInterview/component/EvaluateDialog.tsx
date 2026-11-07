import { Dialog, DialogContent, Typography, Box, Paper, IconButton, DialogActions, Button } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';

function EvaluateDialog({ open, onClose, data }: { open: boolean, onClose: any, data: any }) {
    const { t, i18n } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 1,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }
            }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Typography variant="subtitle1" fontWeight="500" color="text.primary">
                    {t("interviewAiEvaluate")}
                </Typography>
                <IconButton
                    size="small"
                    onClick={onClose}
                    aria-label="close"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <DialogContent sx={{ px: 3, py: 2.5 }}>
                {data && (
                    <Typography
                        variant="body1"
                        sx={{
                            lineHeight: 1.8,
                            color: 'text.primary',
                            fontSize: '0.95rem'
                        }}
                    >
                        {data[i18n?.language]}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2, justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    size="small"
                    onClick={onClose}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 1.5,
                        px: 3
                    }}
                >
                    {t('close')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EvaluateDialog