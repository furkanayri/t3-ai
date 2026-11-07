import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { GeneralForm, PageHeader } from '../component'
import { Formik } from 'formik'
import { enqueueSnackbar } from 'notistack'
import { DisqualifyMail } from 'src/types/Disqualify'
import { useGetDisqualifyEmailTemplatesQuery, usePostDisqualifyEmailTemplateMutation, useUpdateDisqualifyEmailTemplateMutation } from 'src/hooks/useServices/useDisqualifyMailServices'

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
    const disqualifyEmailTemplateQuery = useGetDisqualifyEmailTemplatesQuery()
    const disqualifyEmailTemplate = disqualifyEmailTemplateQuery?.data?.results[0]

    const initialValues: DisqualifyMail = {
        description: mode === 'create' ? '' : disqualifyEmailTemplate?.description ?? '',
    }

    const emailTemplateMutation = usePostDisqualifyEmailTemplateMutation()
    const emailTemplateUpdateMutation = useUpdateDisqualifyEmailTemplateMutation()
    const handleSubmitForm = (values: any, helper: any) => {
        if (mode === 'create') {

            emailTemplateMutation.mutate(values, {
                onSuccess: () => {
                    enqueueSnackbar(t('disqualifyEmailTemplateCreated'), { variant: 'success' });

                    refetch()
                    handleGoBack()
                },
                onError: (error) => {
                    enqueueSnackbar(t('errorCreatingDisqualifyEmailTemplate'), { variant: 'error' });
                }
            })
        }
        if (mode === 'edit' && !!disqualifyEmailTemplate) {
            emailTemplateUpdateMutation.mutate({ id: disqualifyEmailTemplate?._id, data: values }, {
                onSuccess: () => {
                    enqueueSnackbar(t('disqualifyEmailTemplateUpdated'), { variant: 'success' });

                    refetch()
                    handleGoBack()
                },
                onError: (error) => {
                    enqueueSnackbar(t('errorUpdatingDisqualifyEmailTemplate'), { variant: 'error' });
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