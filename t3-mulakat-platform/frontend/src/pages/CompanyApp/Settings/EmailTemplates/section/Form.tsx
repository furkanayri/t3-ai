import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { GeneralForm, PageHeader } from '../component'
import { Formik } from 'formik'
import { useGetOneEmailTemplateQuery, usePostEmailTemplateMutation, useUpdateEmailTemplateMutation } from 'src/hooks/useServices/useEmailTemplateServices'
import { EmailTemplate } from 'src/types'
import { enqueueSnackbar } from 'notistack'

const Form = ({ mode, refetch }: { mode: "create" | "edit", refetch: () => Promise<any> }) => {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const handleGoBack = () => {
        setSearchParams(prev => {
            prev.delete('id')
            prev.delete('open')
            return prev
        })
    }
    const emailTemplateQuery = useGetOneEmailTemplateQuery(searchParams.get('id') || '')
    const emailTemplate = emailTemplateQuery?.data

    const initialValues: EmailTemplate = {
        title: emailTemplate?.title ?? '',
        description: emailTemplate?.description ?? '',
        message: emailTemplate?.message ?? '',
        subject: emailTemplate?.subject ?? '',
    }

    const emailTemplateMutation = usePostEmailTemplateMutation()
    const emailTemplateUpdateMutation = useUpdateEmailTemplateMutation()
    const handleSubmitForm = (values: any, helper: any) => {
        if (mode === 'create') {

            emailTemplateMutation.mutate(values, {
                onSuccess: () => {
                    enqueueSnackbar(t('emailTemplateCreated'), { variant: 'success' });

                    refetch()
                    handleGoBack()
                },
                onError: (error) => {
                    enqueueSnackbar(t('errorCreatingEmailTemplate'), { variant: 'error' });
                }
            })
        }
        if (mode === 'edit' && !!emailTemplate) {
            emailTemplateUpdateMutation.mutate({ id: emailTemplate?._id, data: values }, {
                onSuccess: () => {
                    enqueueSnackbar(t('emailTemplateUpdated'), { variant: 'success' });

                    refetch()
                    handleGoBack()
                },
                onError: (error) => {
                    enqueueSnackbar(t('errorUpdatingEmailTemplate'), { variant: 'error' });
                }
            })
        }

    }
    return (
        <div>
            <Formik
                initialValues={initialValues}
                enableReinitialize
                onSubmit={handleSubmitForm}
            >
                {
                    ({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <PageHeader mode={mode} handleGoBack={handleGoBack} />
                            <GeneralForm />
                        </form>
                    )
                }
            </Formik>
        </div>
    )
}

export default Form