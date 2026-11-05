import React, { useMemo } from 'react'
import { EmailTemplateForm, EmailTemplatesList } from './section'
import { array } from 'src/utils'
import { Alert, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { enqueueSnackbar } from 'notistack'
import { Add } from '@mui/icons-material'
import { CustomButton, Paginate } from 'src/components/shared'
import { useDeleteDisqualifyEmailTemplateMutation, useGetDisqualifyEmailTemplatesQuery } from 'src/hooks/useServices/useDisqualifyMailServices'
import { DisqualifyMail } from 'src/types/Disqualify'

function DisqualifyEmailTemplates() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const pageState = useMemo(() => searchParams.get('open'), [searchParams])
    const deleteMutation = useDeleteDisqualifyEmailTemplateMutation()
    const pageSizes = [6, 12, 25]
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]
    const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])
    const emailTemplatesQuery = useGetDisqualifyEmailTemplatesQuery(query)
    const getDisqualifyEmailTemplates = useMemo(() => array<DisqualifyMail>(emailTemplatesQuery?.data?.results), [emailTemplatesQuery.data])

    const handleDelete = async (_id: string) => {
        deleteMutation.mutateAsync(_id, {
            onSuccess(data) {
                enqueueSnackbar(t('emailTemplateDeleteCompleted'), { variant: 'success' });
                emailTemplatesQuery.refetch()
            },
            onError(error) {
                enqueueSnackbar(t('errorDeletingEmailTemplate'), { variant: 'error' });
            }
        })
    }

    const handleClick = (data: any) => {
        setSearchParams((prev) => {
            prev.set('open', data.type);
            if (!!data._id)
                prev.set('id', data._id)
            return prev;
        });
    }


    return (
        <div className="w-full max-w-4xl pt-12">
            <p className="text-[20px] text-[#5E5E5E] font-medium mb-3">{t('Disqualify Email Templates')}</p>
            <div className='p-[36px]'
                style={{
                    boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                }}
            >
                {pageState === 'detail' && <EmailTemplateForm mode='edit' refetch={emailTemplatesQuery?.refetch} />}
                {pageState === 'create' && <EmailTemplateForm mode='create' refetch={emailTemplatesQuery?.refetch} />}
                {
                    !pageState ?
                        <Paginate
                            isFetching={emailTemplatesQuery.isFetching || emailTemplatesQuery.isPreviousData}
                            pageSizes={pageSizes}
                            count={emailTemplatesQuery?.data?.count}
                        >
                            <div className='flex justify-end'>
                                <CustomButton
                                    onClick={() => handleClick({ type: "create" })}
                                    startIcon={<Add />}
                                    sx={{
                                        backgroundColor: "#fff",
                                        color: "#E31E24",
                                        border: "1px solid #E31E24",
                                        boxShadow: "none",
                                        px: "22px",
                                        fontSize: "14px",
                                        fontWeight: 400,
                                        height: "30px",
                                        '&:hover': {
                                            backgroundColor: "#fff",
                                            boxShadow: "none"
                                        }
                                    }}
                                >
                                    {t('createNew')}
                                </CustomButton>
                            </div>
                            {
                                !emailTemplatesQuery.isLoading && !getDisqualifyEmailTemplates.length ?
                                    <Box mt={2}>
                                        <Alert severity='info'>
                                            {t('disqualifyEmailTepmlateNotFound')}
                                        </Alert>
                                    </Box>
                                    :
                                    <EmailTemplatesList
                                        items={getDisqualifyEmailTemplates}
                                        handleClickAction={handleClick}
                                        handleDelete={handleDelete}
                                    />
                            }
                        </Paginate>
                        : null}
            </div>

        </div>
    )
}

export default DisqualifyEmailTemplates