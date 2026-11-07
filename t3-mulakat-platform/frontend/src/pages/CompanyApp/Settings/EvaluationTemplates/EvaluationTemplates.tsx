import { Alert, Button, Card, CardContent, CircularProgress, Divider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { EvaluationTemplateForm, EvaluationTemplateList } from "./sections";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCreateEvaluationTemplateMutation, useDeleteEvaluationTemplateMutation, useGetAllEvaluationTemplates } from "src/hooks/useServices";
import { EvaluationTemplate, EvaluationTemplatePayload } from "src/types/EvaluationTemplate";
import { array } from "src/utils";
import { enqueueSnackbar } from "notistack";
import { CustomButton, Paginate } from "src/components/shared";
import { Box, Stack } from "@mui/system";
import { Add } from "@mui/icons-material";
import { grey } from "@mui/material/colors";

export default function EvaluationTemplates() {
    const { t, i18n } = useTranslation()

    const [searchParams, setSearchParams] = useSearchParams()
    const pageState = useMemo(() => searchParams.get('open'), [searchParams])

    const createMutation = useCreateEvaluationTemplateMutation()
    const deleteMutation = useDeleteEvaluationTemplateMutation()

    const pageSizes = [6, 12, 25]

    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])

    const evaluationTemplatesQuery = useGetAllEvaluationTemplates(query)

    const evaluationTemplates = useMemo(() => array<EvaluationTemplate>(evaluationTemplatesQuery.data?.results),
        [evaluationTemplatesQuery.data])

    const handleClick = ({ type, _id }: { type: "create" | "detail", _id?: string }) => {
        setSearchParams(prev => {
            prev.set('open', type);
            if (!!_id)
                prev.set('id', _id)
            return prev
        })
    }

    const handleDelete = async (_id: string) => {
        await deleteMutation.mutateAsync(_id, {
            onSuccess: () => {
                enqueueSnackbar(t('evaluationTemplateDeleted'), { variant: "success" })
                evaluationTemplatesQuery.refetch()
            },
            onError: (err) => {
                enqueueSnackbar(t('errorDeletingEvaluationTemplate'), { variant: 'error' });
            }
        })
    }
    const handleCopy = async (item: EvaluationTemplate) => {
        const copyAdditiveWord = i18n.language === 'en' ? " - Copy" : " - Kopya"

        const payload: EvaluationTemplatePayload = {
            title: item.title + copyAdditiveWord,
            scoreCards: item.scoreCards,
            fields: item.fields
        }
        await createMutation.mutateAsync(payload, {
            onSuccess: () => {
                enqueueSnackbar(t('evaluationTemplateCopied'), { variant: "success" })
                evaluationTemplatesQuery.refetch()
            },
            onError: (err) => {
                enqueueSnackbar(t('errorCopyingEvaluationTemplate'), { variant: 'error' });
            }
        })
    }

    return (
        <div className="w-full max-w-4xl pt-12">
            <p className="text-[20px] text-[#5E5E5E] font-medium mb-3">{t('Evaluation Templates')}</p>
            <div className='p-[36px]'
                style={{
                    boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                }}
            >
                {pageState === "detail" ? <EvaluationTemplateForm refetch={evaluationTemplatesQuery.refetch} mode='edit' /> : null}
                {pageState === "create" ? <EvaluationTemplateForm refetch={evaluationTemplatesQuery.refetch} mode='create' /> : null}
                {!pageState ?
                    <Paginate
                        isFetching={evaluationTemplatesQuery.isFetching || evaluationTemplatesQuery.isPreviousData}
                        pageSizes={pageSizes}
                        count={evaluationTemplatesQuery?.data?.count}
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
                                {t("createNew")}
                            </CustomButton>
                        </div>
                        {!evaluationTemplatesQuery.isLoading && !evaluationTemplates?.length ?
                            <Box mt={2}>

                                <Alert severity='info'>{t('thereAreNoTemplatesYet')}</Alert>
                            </Box>
                            :
                            <EvaluationTemplateList
                                items={evaluationTemplates}
                                handleClickAction={handleClick}
                                handleCopy={handleCopy}
                                handleDelete={handleDelete}
                            />
                        }
                    </Paginate>
                    : null}
            </div>
        </div>

    )
}
