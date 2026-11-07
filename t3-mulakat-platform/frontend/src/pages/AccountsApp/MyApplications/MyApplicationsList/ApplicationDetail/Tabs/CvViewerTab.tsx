import { Box } from '@mui/material'
import React from 'react'
import { PDFViewer } from 'src/components'
import { API_BASE_URL } from 'src/constants'

const CvViewerTab = ({ fileId }: { fileId: string }) => {
    return (
        <Box>
            <PDFViewer fileUrl={`${API_BASE_URL}/v1/upload/cv/${fileId}`} />
        </Box>
    )
}

export default CvViewerTab