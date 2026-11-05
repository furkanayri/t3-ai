import { Box, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

const CoverLetterTab = ({ application }: { application: any }) => {
    const { t } = useTranslation();
    return (
        <Box>
            <Typography variant="h5" marginBottom={2} fontWeight={600}>{t('yourCoverLetter')}</Typography>
            <Box>
                <Typography whiteSpace={"pre-line"}> {application?.coverLetter ?? ''} </Typography>
            </Box>
        </Box>
    )
}

export default CoverLetterTab