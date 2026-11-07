import { ArrowForward, ContentCopy, DeleteOutlined } from '@mui/icons-material'
import { Box, Divider, IconButton, Tooltip } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { EvaluationTemplate } from 'src/types/EvaluationTemplate'
import { ConfirmAction } from '../../../../../components/shared'
import { ArrowRight02Icon, Copy01Icon, Delete01Icon, DocumentValidationIcon, Edit02Icon, PencilEdit01Icon } from 'hugeicons-react'

type IProptypes = {
    items: EvaluationTemplate[],
    handleClickAction: (args: { type: "create" | "detail", _id?: string }) => void
    handleCopy: (item: EvaluationTemplate) => Promise<void>
    handleDelete: (_id: string) => Promise<void>
}

export default function EvaluationTemplatesList({ items, handleClickAction, handleDelete, handleCopy }: IProptypes) {
    const { t } = useTranslation()
    return (
        <div className='flex flex-col gap-4 mt-[40px]'>
            <div className='flex text-black text-sm font-medium mb-[12px]'>
                <p className='w-[284px]'>{t('title')}</p>
            </div>
            <div className='divide-y-[1px] border-[#ECECEC]'>
                {items?.map((item, ind) =>
                    <div key={ind} className='group flex justify-between items-center gap-2 cursor-pointer py-[20px]'>
                        <div className='flex items-center gap-[18px]'>
                            {/* <div className='opacity-0 group-hover:opacity-100 duration-300 group-hover:pl-2 '>
                            <ArrowRight02Icon size={18} />
                        </div> */}
                            <DocumentValidationIcon color="#E31E24" size={18} />
                            <p className='text-sm font-medium w-[240px] text-[#141B34]'>
                                {item?.title}
                            </p>
                        </div>
                        <div className='flex items-center justify-end'>
                            <Tooltip title={t("edit")}>
                                <IconButton
                                    onClick={() => handleClickAction({ type: "detail", _id: item._id })}
                                    sx={{ "&:hover": { backgroundColor: "#fff" } }}
                                >
                                    <Edit02Icon size={18} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("copy")}>
                                <IconButton
                                    onClick={() => handleCopy(item)}
                                    sx={{ "&:hover": { backgroundColor: "#fff" } }}
                                >
                                    <Copy01Icon size={18} />
                                </IconButton>
                            </Tooltip>
                            <ConfirmAction
                                title={t('confirmDeletion')}
                                description={t('confirmEvaluationTemplateDeletion')}
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
