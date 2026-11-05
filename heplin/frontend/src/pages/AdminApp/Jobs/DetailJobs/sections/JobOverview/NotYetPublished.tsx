import { Button } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PublishDialog from './PublishDialog'

export default function NotYetPublished() {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    const handleClickPublish = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div className='flex items-center justify-between'>
            <p>{t('notPublishedYet')}</p>
            <Button
                variant='outlined'
                sx={{ height: 37 }}
                onClick={handleClickPublish}
            >
                {t('Publish')}
            </Button>
            <PublishDialog
                open={open}
                onClose={handleClose}
            />
        </div>
    )
}
