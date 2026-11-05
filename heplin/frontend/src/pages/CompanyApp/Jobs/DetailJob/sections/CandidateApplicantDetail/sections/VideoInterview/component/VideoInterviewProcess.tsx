import {
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Typography,
    IconButton,
    Box,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Button,
    Divider,
    Alert,
    useTheme
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { useGetTenantInterviewAnswerQuery } from 'src/hooks/useServices';
import { useVideoPresignedUrl } from 'src/hooks/useServices/useAiVideoInterviewServices';
import { useGetAiInterviewQuestionsQuery } from 'src/hooks/useServices/useInterviewServices';
import ReactPlayer from 'react-player';
import BatchAiEvaluationCard from './BatchAiEvaluationCard';

const VideoInterviewProcess = ({ candidateAnswersId, interviewEvaluate, interviewId }: { candidateAnswersId: any, interviewEvaluate: any, interviewId: any }) => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const { data, isLoading, error } = useGetTenantInterviewAnswerQuery({
        candidateAnswersId: candidateAnswersId ?? ''
    });

    const { data: interviewQuestionsData } = useGetAiInterviewQuestionsQuery({
        interviewId: interviewId ?? ''
    });

    const currentQuestion = data?.interiewAnswers?.[currentQuestionIndex];
    const fileKey = currentQuestion?.fileKey;

    const currentQuestionDetail = interviewQuestionsData?.questions?.find(
        (q: any) => q._id === currentQuestion?.questionId
    );

    const { data: presignedData, isLoading: isLoadingUrl, isError: isVideoUnavailable } = useVideoPresignedUrl(fileKey || '');

    useEffect(() => {
        if (presignedData?.presignedUrl) {
            setVideoUrl(presignedData.presignedUrl);
        } else {
            setVideoUrl(null);
        }
    }, [presignedData]);


    const handleNextQuestion = () => {
        if (data?.interiewAnswers && currentQuestionIndex < data.interiewAnswers.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        }
    };

    const handleJumpToQuestion = (index: number) => {
        if (data?.interiewAnswers && index >= 0 && index < data.interiewAnswers.length) {
            setCurrentQuestionIndex(index);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 2 }}>
                <Typography color="error">{t('errorLoadingInterviewData')}</Typography>
            </Box>
        );
    }

    if (!data || !data.interiewAnswers || data.interiewAnswers.length === 0) {
        return (
            <Box sx={{ py: 2 }}>
                <Typography>{t('interviewNotFound')}</Typography>
            </Box>
        );
    }

    const answers = data?.interiewAnswers;

    function currentEvaluate() {
        return interviewEvaluate.evaluation[i18n.language].find((item: any) => {
            return item.questionId === currentQuestion.questionId
        })

    }

    return (
        <Box>
            <Stepper
                activeStep={currentQuestionIndex}
                alternativeLabel
                sx={{
                    mb: 2,
                    '& .MuiStepConnector-line': {
                        minWidth: 20
                    }
                }}
            >
                {answers.map((answer: any, index: any) => (
                    <Step key={answer._id}>
                        <StepLabel
                            onClick={() => handleJumpToQuestion(index)}
                            sx={{ cursor: 'pointer' }}
                        >
                            {t('question')} {index + 1}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ mb: 2 }}>
                <Typography
                    variant="h6"
                    sx={{
                        p: 1.5,
                        mb: 1.5,
                        fontWeight: 'medium',
                        color: 'white',
                        bgcolor: 'primary.main',
                        borderRadius: '4px 4px 0 0'
                    }}
                >
                    {`${t('question')} ${currentQuestionIndex + 1}/${answers.length}: ${currentQuestion.question}`}
                </Typography>

                {currentQuestionDetail?.evaluationCriteria && (
                    <Box sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: theme.palette.info.light,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.info.main}`
                    }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, color: theme.palette.info.dark }}>
                            🎯 {t('evaluationCriteria')}:
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.info.dark }}>
                            {currentQuestionDetail.evaluationCriteria}
                        </Typography>
                    </Box>
                )}

                <BatchAiEvaluationCard
                    candidateAnswerId={String(candidateAnswersId || '')}
                    answerId={String(currentQuestion?._id || '')}
                />

                {
                    currentEvaluate() &&
                    <Box sx={{ mt: 2, mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                            {t('Ai Evaluation')} ⭐{currentEvaluate()?.score && `${currentEvaluate()?.score}/10`}
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1, border: `1px solid ${theme.palette.grey[200]}` }}>
                            <Typography variant="body2">
                                {currentEvaluate()?.evaluation}
                            </Typography>
                        </Box>
                    </Box>
                }
                {isLoadingUrl ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={30} />
                        <Typography sx={{ ml: 2 }}>{t('loading_video')}</Typography>
                    </Box>
                ) : isVideoUnavailable ? (
                    <Alert severity="warning" sx={{ my: 2 }}>
                        {t('video.localUnavailable')}
                    </Alert>
                ) : currentQuestion.fileKey && videoUrl ? (
                    <Box sx={{ my: 2 }}>
                        <ReactPlayer
                            url={videoUrl}
                            controls
                            width="100%"
                            height="auto"
                            style={{
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ my: 2, p: 2, bgcolor: theme.palette.error.light, borderRadius: 1 }}>
                        <Typography variant="body1" color="error.dark">
                            {t('noResponse')}
                        </Typography>
                    </Box>
                )}

                {currentQuestion?.transcription?.text && (
                    <Box sx={{ mt: 2, mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                            {t('answer')}:
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1, border: `1px solid ${theme.palette.grey[200]}` }}>
                            <Typography variant="body2">
                                {currentQuestion.transcription.text}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Navigation Controls */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    bgcolor: theme.palette.grey[50],
                    p: 2,
                    borderRadius: '0 0 4px 4px',
                    border: `1px solid ${theme.palette.grey[200]}`
                }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outlined"
                    color="primary"
                >
                    {t('back')}
                </Button>

                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                    {currentQuestionIndex + 1} / {answers.length}
                </Typography>

                <Button
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === answers.length - 1}
                    variant="contained"
                    color="primary"
                >
                    {t('next')}
                </Button>
            </Box>
        </Box>
    );
};

export default VideoInterviewProcess;
