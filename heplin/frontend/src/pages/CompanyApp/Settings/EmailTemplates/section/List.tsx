import { IconButton, Tooltip } from '@mui/material'
import { Delete01Icon, Edit02Icon, Mail02Icon } from 'hugeicons-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmAction } from 'src/components/shared'
import { EmailTemplate } from 'src/types'

type IProptypes = {
    items: EmailTemplate[],
    handleClickAction: (args: { type: "create" | "detail", _id?: string }) => void
    handleDelete: (_id: string) => Promise<void>
}
const EmailTemplateList = ({ items, handleDelete, handleClickAction }: IProptypes) => {
    const { t } = useTranslation();

    return (
        <div className='flex flex-col gap-4 mt-[40px]'>
            <div className='flex text-black text-sm font-medium mb-[12px]'>
                <p className='w-[284px]'>{t('title')}</p>
                <p className='w-[400px]'>{t('description')}</p>
            </div>
            <div className='divide-y-[1px] border-[#ECECEC]'>

                {items?.map((item: any, ind) =>
                    <div key={ind} className='flex justify-between items-center gap-2 cursor-pointer py-[20px]'>
                        <div className='flex items-center gap-[18px]'>
                            <Mail02Icon color="#E31E24" size={18} />
                            <p className='text-sm font-medium w-[240px] text-[#141B34]'>
                                {item?.title}
                            </p>
                        </div>
                        <p className='text-sm font-medium text-[#979797] grow-0 truncate max-w-[400px]'>
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
        </div>
    )
}

export default EmailTemplateList