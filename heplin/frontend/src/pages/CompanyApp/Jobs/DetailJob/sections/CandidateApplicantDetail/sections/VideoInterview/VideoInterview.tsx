import {
    Card,
    CardContent,
    Divider,
    Typography,
    Box,
    Paper,
    useTheme,
    LinearProgress,
    Container,
    Tooltip,
    IconButton,
    Pagination,
    Stack,
    Chip,
    Button
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import VideoInterviewProcess from './component/VideoInterviewProcess'
import { array } from 'src/utils'
import { useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import { useGetInterviewAnswersByTypeQuery, useVideoInterviewEvaluation } from 'src/hooks/useServices/useInterviewServices'
import { useCandidateDetail } from '../../CandidateApplicantDetail'
import { Paginate } from 'src/components/shared'
import { useTranslation } from 'react-i18next'
import VideocamIcon from '@mui/icons-material/Videocam';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useDialog } from 'src/hooks/use-dialog'
import EvaluateDialog from './component/EvaluateDialog'
import toast from 'react-hot-toast'

export default function VideoInterview() {
    const { applicantState } = useCandidateDetail();
    const { id: jobId } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const { data, handleClose, handleOpen, open } = useDialog();

    const candidateId = React.useMemo(() => {
        return searchParams.get('candidateId');
    }, [searchParams]);

    const pageSizes = [1]

    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const candidateAnswerQuery = useGetInterviewAnswersByTypeQuery({
        interviewType: 'video',
        candidateId: candidateId || '',
        page: page + 1,
        limit: 1
    });

    const interviewResults: any = array(candidateAnswerQuery?.data?.results)




    const totalInterviews = candidateAnswerQuery?.data?.count || 0;

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSearchParams((prev) => {
            if (value === 1) prev.delete('page');
            else prev.set('page', (value - 1).toString());
            return prev;
        });
    };

    const handlePrevInterview = () => {
        if (page > 0) {
            setSearchParams((prev) => {
                prev.set('page', (page - 1).toString());
                return prev;
            });
        }
    };

    const handleNextInterview = () => {
        if (page < totalInterviews - 1) {
            setSearchParams((prev) => {
                prev.set('page', (page + 1).toString());
                return prev;
            });
        }
    };

    const videoInterviewEvaluateMutation = useVideoInterviewEvaluation();



    const handleEvaluate = async (candidateInterviewId: string, candidateAnswersId: any) => {

        if (!candidateInterviewId || !candidateAnswersId) {
            return;
        }
        try {
            await videoInterviewEvaluateMutation.mutateAsync({
                interviewId: candidateInterviewId,
                candidateAnswersId: candidateAnswersId
            });
            await candidateAnswerQuery.refetch();
        } catch (error) {
            toast.success(t('interviewEvaluateError'));

        }
    }


    if (candidateAnswerQuery.isFetching) {
        return (
            <Container maxWidth="lg" sx={{ py: 2 }}>
                <Box
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.grey[200]}`,
                        backgroundColor: theme.palette.background.paper,
                    }}
                >
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideocamIcon color="primary" /> {t('interviewAiEvaluate')}
                    </Typography>
                    <LinearProgress />
                </Box>
            </Container>
        );
    }



    if (interviewResults.length === 0 && !candidateAnswerQuery?.isFetching) {
        return (
            <Container maxWidth="lg" sx={{ py: 2 }}>
                <Box
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.grey[200]}`,
                        backgroundColor: theme.palette.background.paper,
                    }}
                >
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideocamIcon color="primary" /> {t('interviewAiEvaluate')}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">{t('NoInterviewFound')}</Typography>
                    </Box>
                </Box>
            </Container>
        )
    }
    const hasEvaluationData = (data: any) => {
        return data?.evaluation?.tr?.length > 0 || data?.evaluation?.en?.length > 0;
    };
    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <EvaluateDialog
                data={data}
                open={open}
                onClose={handleClose}
            />
            <Box >
                {interviewResults?.map((candidateInterview: any) => {

                    return (
                        <Paper
                            key={candidateInterview?._id}
                            elevation={0}
                            sx={{
                                mb: 4,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.grey[200]}`,
                            }}
                        >

                            <Box
                                sx={{
                                    p: 2.5,
                                    borderBottom: '1px solid',
                                    borderColor: theme.palette.primary.light,
                                    bgcolor: `${theme.palette.primary.light}20`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: theme.palette.primary.dark
                                        }}
                                    >
                                        {candidateInterview?.name}
                                    </Typography>

                                    <Chip
                                        size="small"
                                        label={`${page + 1} / ${totalInterviews}`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                    {
                                        !candidateInterview?.isEvaluated && !hasEvaluationData(candidateInterview?.interviewEvaluate) &&
                                        candidateInterview?.candidateAnswersId?.interiewAnswers?.length > 0 &&
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AssessmentIcon />}

                                            onClick={() => {
                                                handleEvaluate(
                                                    candidateInterview?._id,
                                                    candidateInterview?.candidateAnswersId?._id
                                                );
                                            }}
                                            disabled={videoInterviewEvaluateMutation?.isLoading}
                                            color="secondary"
                                            sx={{ ml: 1 }}
                                        >
                                            {videoInterviewEvaluateMutation?.isLoading ? t("Evaluating") : t("Evaluate")}
                                        </Button>
                                    }

                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {
                                        candidateInterview?.evaluationScore &&
                                        <Box>
                                            {t('candidateScore')}: {candidateInterview?.evaluationScore}
                                        </Box>
                                    }


                                    {
                                        hasEvaluationData(candidateInterview?.interviewEvaluate) &&
                                        <Tooltip title={t('interviewAiEvaluate')}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpen(
                                                    candidateInterview?.interviewEvaluate?.generalEvaluation,
                                                )}
                                                color="primary"
                                            >
                                                <AssessmentIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip >
                                    }


                                    <Box>
                                        <Tooltip title={t('back')}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={handlePrevInterview}
                                                    disabled={page === 0}
                                                    color="primary"
                                                >
                                                    <ArrowBackIosNewIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title={t('next')}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={handleNextInterview}
                                                    disabled={page >= totalInterviews - 1}
                                                    color="primary"
                                                >
                                                    <ArrowForwardIosIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Box>

                                </Box>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <VideoInterviewProcess
                                    interviewEvaluate={candidateInterview?.interviewEvaluate}
                                    candidateAnswersId={candidateInterview?.candidateAnswersId?._id}
                                    interviewId={candidateInterview?.interviewId}
                                />
                            </Box>

                            {/* {totalInterviews > 1 && (
                                <Box sx={{
                                    p: 2,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    borderTop: `1px solid ${theme.palette.grey[200]}`
                                }}>
                                    <Pagination
                                        count={totalInterviews}
                                        page={page + 1}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="small"
                                        siblingCount={1}
                                    />
                                </Box>
                            )} */}
                        </Paper>
                    )
                })}
            </Box>
        </Container>
    )
}

