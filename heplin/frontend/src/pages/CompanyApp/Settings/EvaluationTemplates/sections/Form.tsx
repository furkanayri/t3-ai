import { CircularProgress, Stack } from '@mui/material'
import { Formik, FormikHelpers, } from 'formik'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useCreateEvaluationTemplateMutation, useGetOneEvaluationTemplate, useUpdateEvaluationTemplateMutation } from 'src/hooks/useServices'
import { EvaluationTemplatePayload } from 'src/types/EvaluationTemplate'
import { Fields, PageHeader, ScoreCards, Title } from './components'
import { useMemo } from 'react'

export default function Form({ mode, refetch }: { mode: "create" | "edit", refetch: () => Promise<any> }) {
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar();

    const createEvaluationTemplateMutation = useCreateEvaluationTemplateMutation()

    const updateEvaluationTemplateMutation = useUpdateEvaluationTemplateMutation()

    const [searchParams, setSearchParams] = useSearchParams()
    const handleGoBack = () => {
        setSearchParams(prev => {
            prev.delete('open')
            prev.delete('id')

            return prev
        })
    }

    const evaluationTemplateDetailQuery = useGetOneEvaluationTemplate({ id: searchParams.get('id') ?? "", enabled: mode === 'edit' })
    const evaluationTemplate = useMemo(() => evaluationTemplateDetailQuery.data?.evaluationTemplate, [evaluationTemplateDetailQuery.data]) ?? undefined

    const initialValues: EvaluationTemplatePayload = {
        title: evaluationTemplate?.title ?? "",
        fields: evaluationTemplate?.fields ?? [],
        scoreCards: evaluationTemplate?.scoreCards ?? [],
    }

    const handleSubmitForm = (values: EvaluationTemplatePayload, helpers: FormikHelpers<EvaluationTemplatePayload>) => {
        if (mode === "create") {
            createEvaluationTemplateMutation.mutateAsync(values, {
                onSuccess: async (data) => {
                    enqueueSnackbar(t('evaluationTemplateCreated'), { variant: 'success' });
                    await refetch()
                    handleGoBack()
                },
                onError: (err) => {
                    enqueueSnackbar(t('errorCreatingEvaluationTemplate'), { variant: 'error' });
                },
            }
            )
        }
        if (mode === "edit" && !!evaluationTemplate) {
            updateEvaluationTemplateMutation.mutateAsync({ payload: values, id: evaluationTemplate._id }, {
                onSuccess: async (data) => {
                    enqueueSnackbar(t('evaluationTemplateUpdated'), { variant: 'success' });
                    await refetch()
                    handleGoBack()
                },
                onError: (err) => {
                    enqueueSnackbar(t('errorUpdatingEvaluationTemplate'), { variant: 'error' });
                },
            }
            )
        }
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmitForm}
            enableReinitialize
        //TODO: add validation
        // validationSchema: stageSchema
        >
            {({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2} alignItems="center">
                        <PageHeader mode={mode} handleGoBack={handleGoBack} />
                        {evaluationTemplateDetailQuery.isFetching ?
                            <CircularProgress sx={{ width: "100%", mx: "auto", my: 4 }} />
                            :
                            <>
                                <Title />
                                <ScoreCards />
                                <Fields />
                            </>
                        }
                    </Stack>
                </form>
            )}
        </Formik>
    )
}

