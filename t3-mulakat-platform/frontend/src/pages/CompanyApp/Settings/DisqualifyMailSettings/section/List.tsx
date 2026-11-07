import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material'
import { Delete01Icon, Edit02Icon } from 'hugeicons-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmAction } from 'src/components/shared'
import { DisqualifyMail } from 'src/types/Disqualify'

type IProptypes = {
    items: DisqualifyMail[],
    handleClickAction: (args: { type: "create" | "detail", _id?: string }) => void
    handleDelete: (_id: string) => Promise<void>
}

const DisqualifyEmailTemplateList = ({ items, handleDelete, handleClickAction }: IProptypes) => {
    const { t } = useTranslation();
    const [openDialog, setOpenDialog] = useState(false)
    const [dialogContent, setDialogContent] = useState('')

    const handleOpenDialog = (description: string) => {
        setDialogContent(description)
        setOpenDialog(true)
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setDialogContent('')
    }

    return (
        <div className='flex flex-col gap-4 mt-[40px]'>
            <div className='flex text-black text-sm font-medium mb-[12px]'>
                <p className='w-[284px]'>{t('ContentDisqualifyMail')}</p>
            </div>
            <div className='divide-y-[1px] border-[#5a2e2e]'>

                {items?.map((item: any, ind) =>
                    <div key={ind} className='flex justify-between items-center gap-2 cursor-pointer py-[20px]'>
                        
                        {/* Tüm açıklamayı görmek için tıklanabilir bir alan */}
                        <p 
                            className='text-sm font-medium text-[#979797] grow-0 truncate max-w-[400px]'
                            onClick={() => handleOpenDialog(item?.description)}
                            style={{ cursor: 'pointer' }}
                        >
                            {item?.description}
                        </p>
                        
                        <div className='flex items-center justify-end'>
                            <Tooltip title={t("edit")}>
                                <IconButton
                                    onClick={() => handleClickAction({ type: "detail", _id: item._id })}
                                    sx={{ "&:hover": { backgroundColor: "#fff" } }}
                                >
                                    <Edit02Icon size={18} />
                                </IconButton>
                            </Tooltip>
                            <ConfirmAction
                                title={t('confirmDeletion')}
                                description={t('confirmEmailTemplateDeletion')}
                                onConfirm={async () => {
                                    await handleDelete(item?._id)
                                }}
                            >
                                <Tooltip title={t("delete")}>
                                    <div className='p-[8px]'>
                                        <Delete01Icon size={18} color='#FD5F5F' />
                                    </div>
                                </Tooltip>
                            </ConfirmAction>
                        </div>
                    </div>
                )}
            </div>

            {/* Açıklamaları göstermek için Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{t('Disqualify Email Template')}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        minRows={5}
                        variant="outlined"
                        value={dialogContent}
                        InputProps={{
                            readOnly: true
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        {t('close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default DisqualifyEmailTemplateList
