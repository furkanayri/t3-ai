import React, { useState } from 'react'
import {
    Drawer,
    IconButton,
    Typography,
    Box,
    useMediaQuery,
    backdropClasses
} from '@mui/material'
import { Theme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import { CvViewer } from '../sections/OverviewTab/sections'
import { API_BASE_URL } from 'src/constants'
import { PDFViewer } from 'src/components'
import { useTranslation } from 'react-i18next'

interface CvDetailDrawerProps {
    open: boolean
    onClose: () => void
    cvData?: {
        jobId: string
        fileId: string
        userInfo: string
    }
}


function CvDetailDrawer({ open, onClose, cvData }: CvDetailDrawerProps) {
    const { t } = useTranslation();

    return (
        <Drawer
            anchor={'left'}
            open={open}
            variant="persistent"
            ModalProps={{
                sx: {
                    [`& .${backdropClasses.root}`]: {
                        background: 'transparent !important',
                    },
                },
            }}
            onClose={onClose}
            PaperProps={{
                sx: {
                    maxWidth: '100%',
                    width: '40vw',
                },
            }}
        >
            <Box sx={{ px: 2, py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',mb: 2 }}>
                    <Typography variant="h6">{t('cvFile')}</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>

                </Box>

                <Box>
                    {cvData?.fileId && <PDFViewer fileUrl={`${API_BASE_URL}/v1/upload/cv/${cvData?.fileId}`} />}
                </Box>
            </Box>

        </Drawer>
    )
}

export default CvDetailDrawer