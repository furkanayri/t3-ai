import React, { useMemo } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Tooltip,
    Typography,
} from '@mui/material';
import { ExpandMore, QuestionAnswer, SmartToy } from '@mui/icons-material';
import { useCandidateDetail } from '../../../CandidateApplicantDetail';
import { useAiInterviewsAnswersGetAllQuery } from 'src/hooks/useServices';
import { useTranslation } from 'react-i18next';
import { MagicWand01Icon } from 'hugeicons-react';
import { useGetInterviewList, useTextInterviewEvaluation } from 'src/hooks/useServices/useInterviewServices';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { Paginate } from 'src/components/shared';
import { formatDuration, intervalToDuration } from 'date-fns';
import { ca, enUS, tr } from "date-fns/locale";

function InterviewProcess() {
    const { t, i18n } = useTranslation();
    const { applicantState } = useCandidateDetail();
    const { id: jobId } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const candidateId = React.useMemo(() => searchParams.get('candidateId'), [searchParams]);
    const applicantId = applicantState?.data?._id;


    const pageSizes = [1]

    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const query = useMemo(() => `&page=${page + 1}&limit=${1}`, [page, limit])
    const textInterviewEvaluateMutation = useTextInterviewEvaluation()




    const handleEvaluate = async (interviewId: string, candidateAnswersId: string) => {
        if (!jobId || !candidateId) return;
        try {
            await textInterviewEvaluateMutation.mutateAsync({
                interviewId: interviewId,
                candidateAnswersId: candidateAnswersId
            });
            await candidateAnswerQuery.refetch();
        } catch (error) {
            console.error("Evaluation failed:", error);
        }
    };

    const candidateAnswerQuery = useGetInterviewList({
        jobApplicationId: applicantId,
        jobId: jobId ?? '',
        interviewType: 'text',
        query: query
    });
    const candidateAnswers = candidateAnswerQuery?.data?.results;

    const language = i18n?.language;

    if (candidateAnswers?.length === 0 && !candidateAnswerQuery?.isFetching) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6">{t('interviewAiEvaluate')}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography>{t('NoInterviewFound')}</Typography>
                </CardContent>
            </Card>
        )
    }

    if (candidateAnswerQuery?.isFetching) {
        return (
            <div className="w-full flex items-center justify-center">
                <CircularProgress />
            </div>
        );
    }
    const locales: any = {
        en: enUS,
        tr: tr
    };

    return (
        <div>
            <Paginate
                isFetching={candidateAnswerQuery.isFetching || candidateAnswerQuery.isPreviousData}
                pageSizes={pageSizes}
                count={candidateAnswerQuery?.data?.count}
            >
                {candidateAnswers?.map((item: any, index: number) => {

                    if (item?.candidateAnswersId?.interiewAnswers?.length === 0) {
                        return (
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{t('interviewAiEvaluate')}</Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography>{t('interviewPending')}</Typography>
                                </CardContent>
                            </Card>
                        );
                    }

                    return (

                        <Box>
                            <Card variant="outlined" sx={{ mb: 2, border: '1px solid', borderColor: 'primary.main', }} >

                                <CardContent>
                                    {item?.isEvaluated ? (
                                        <div>
                                            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', color: "#E31E24" }}>
                                                {t("Evaluation Results")}
                                            </Typography>
                                            <Box display="flex" alignItems="center" sx={{ mt: 4, color: "#E31E24" }}>
                                                <MagicWand01Icon size={28} color={"#E31E24"} />
                                                <Typography variant="h6" sx={{ ml: 2 }}>
                                                    {t('evaluationScore')}: % {item?.evaluationScore}
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ mt: 4, color: "#E31E24", fontWeight: 'bold' }}>
                                                {t("Evaluation")}
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ mt: 2, }}>
                                                {item?.interviewEvaluate?.generalEvaluation[i18n?.language]}
                                            </Typography>

                                            <div>
                                                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                                                    {item?.interviewEvaluate?.evaluation[i18n?.language].map((item: any, index: number) => (
                                                        <li
                                                            key={index}
                                                            className="flex justify-between gap-2 items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                                                        >
                                                            <span>{item?.evaluation}</span>
                                                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                                ⭐ {item?.score}/10
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>

                                            </div>
                                        </div>
                                    ) : null
                                    }
                                    {!item?.isEvaluated && item?.candidateAnswersId?.interiewAnswers?.length > 0 && (
                                        <div className="w-full flex items-center justify-center mb-4 space-x-10">
                                            <p className="font-extrabold text-xl text-gray-500">
                                                {t("No evaluation has been performed yet.")}
                                            </p>
                                            {
                                                textInterviewEvaluateMutation.isLoading ? <CircularProgress size={20} /> :
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleEvaluate(item._id, item.candidateAnswersId?._id)}
                                                        disabled={textInterviewEvaluateMutation.isLoading}
                                                    >
                                                        {t("Evaluate")}
                                                    </Button>

                                            }

                                        </div>
                                    )}
                                </CardContent>


                            </Card>

                            <Accordion className='p-4' key={item._id} elevation={3} sx={{ mb: 2 }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    aria-controls={`panel${index}-content`}
                                    id={`panel${index}-header`}
                                    sx={{ border: '1px solid', borderColor: '#E31E24', borderRadius: 2, }}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            {index + 1}. {item?.name}
                                        </Typography>
                                        <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>{t("interviewresult")}</Typography>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails sx={{ border: '1px solid', borderColor: '#E31E24', borderRadius: 2, mt: 1 }} >

                                    <Card variant="outlined" sx={{ mb: 2, border: '1px solid', borderColor: 'primary.main', }}>
                                        <CardContent>
                                            <div className="flex justify-end mb-2 gap-2">
                                                <Tooltip title={t('numberCopyPaste')}>
                                                    <Badge
                                                        badgeContent={item?.eventLogs.filter((log: any) => log?.eventType === 'copy').length}
                                                        color="secondary"
                                                    >
                                                        <Chip label={t('copyPaste')} variant="outlined" sx={{ borderColor: 'secondary.main' }} color="secondary" />
                                                    </Badge>
                                                </Tooltip>
                                                <Tooltip title={t('numbertabchange')}>
                                                    <Badge
                                                        badgeContent={item?.eventLogs.filter((log: any) => log?.eventType === 'tabChange').length}
                                                        color="error"
                                                    >
                                                        <Chip label={t('tabChange')} variant="outlined" sx={{ borderColor: 'error.main' }} color="error" />
                                                    </Badge>
                                                </Tooltip>
                                            </div>
                                            {item?.candidateAnswersId?.interiewAnswers?.map((answer: any, idx: number) => (
                                                <Card key={idx} variant="outlined" sx={{ mb: 2, }}>
                                                    <CardContent>
                                                        <QuestionAnswer sx={{ mr: 1, color: "#5149cf" }} color="action" />
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            {t('question')}: {answer?.question}
                                                        </Typography>
                                                        <Typography variant="subtitle1">
                                                            {t('answer')}: {answer?.answer}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {t('interviewerEvaluation')}: {answer?.evaluateAnswer}
                                                        </Typography>

                                                        <p className="text-end">
                                                            {answer?.responseTime ? (
                                                                <>
                                                                    ⏳{" "}
                                                                    {formatDuration(
                                                                        intervalToDuration({ start: 0, end: answer?.responseTime * 1000 }),
                                                                        { format: ["minutes", "seconds"], locale: locales[i18n.language] }
                                                                    )}
                                                                </>
                                                            ) : (
                                                                "0s"
                                                            )}
                                                        </p>


                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </AccordionDetails>
                            </Accordion>
                        </Box>

                    )
                }
                )
                }
            </Paginate>

        </div>
    );
}

export default InterviewProcess;