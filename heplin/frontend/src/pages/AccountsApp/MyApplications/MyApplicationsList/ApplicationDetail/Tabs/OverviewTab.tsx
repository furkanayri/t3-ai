import { Box, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HTMLRender } from 'src/components'

const OverviewTab = ({ application }: { application: any }) => {
    const { t } = useTranslation();
    if (!application) return "Nothing to view here."
    return (
        <Box>
            <Typography variant="h5" marginBottom={2} fontWeight={600}>{t('jobDetails')}</Typography>
            <Box>
                <HTMLRender html={application?.jobId?.content ?? ''} />
            </Box>
        </Box>
    )
}

export default OverviewTab