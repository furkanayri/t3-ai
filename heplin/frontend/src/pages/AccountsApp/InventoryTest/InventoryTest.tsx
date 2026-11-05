import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    LinearProgress,
    Radio,
    RadioGroup,
    FormControlLabel,
    Stack,
    Typography,
    Paper,
    Slider,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Seo } from 'src/components/seo';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
    startPersonalityTest,
    getCurrentQuestion,
    submitAnswer,
} from 'src/services/personalityTestServices';
import { useCheckEligibility } from 'src/hooks/useServices/usePersonelityTest';

type TestScreen = 'start' | 'test' | 'completed';

const personalityTestQuestionCount = Number(import.meta.env.VITE_PERSONALITY_TEST_QUESTION_LIMIT) || 64;

interface Question {
    id: string;
    text: string;
    questionNumber: number;
}

interface SessionData {
    sessionId: string;
    totalQuestions: number;
    currentQuestionNumber: number;
    timeRemaining: number;
    isCompleted: boolean;
}

export function Component() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();

    const [screen, setScreen] = useState<TestScreen>('start');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedScore, setSelectedScore] = useState<number | null>(null);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    // Check eligibility
    const { data: eligibilityData, isLoading: isCheckingEligibility } = useCheckEligibility();

    // Load session from localStorage on mount
    useEffect(() => {
        const savedSessionId = localStorage.getItem('personality_test_session_id');
        if (savedSessionId) {
            setSessionId(savedSessionId);
            loadCurrentQuestion(savedSessionId);
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (screen !== 'test' || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [screen, timeRemaining]);

    const handleTimeUp = () => {
        enqueueSnackbar(t('PersonalityTest.timeUpSnackbar'), { variant: 'warning' });
        setScreen('completed');
        localStorage.removeItem('personality_test_session_id');
    };

    const handleStartTest = async () => {
        setIsLoading(true);
        try {
            const response = await startPersonalityTest({});
            const responseData = response.data || response;
            const sessionId = responseData.sessionId || responseData.session?.id;

            setSessionId(sessionId);
            localStorage.setItem('personality_test_session_id', sessionId);

            await loadCurrentQuestion(sessionId);
        } catch (error: any) {
            enqueueSnackbar(error?.response?.data?.message || t('PersonalityTest.testStartFailed'), {
                variant: 'error',
            });
            setIsLoading(false);
        }
    };

    const loadCurrentQuestion = async (sessionId: string) => {
        setIsLoading(true);
        try {
            const response = await getCurrentQuestion(sessionId);
            const responseData = response.data || response;

            if (responseData.isCompleted || responseData.answeredQuestions === responseData.totalQuestions) {
                setScreen('completed');
                window.location.reload();
                localStorage.removeItem('personality_test_session_id');
            } else {
                // API response: data.currentQuestion
                const question = responseData.currentQuestion;
                setCurrentQuestion({
                    id: question.id.toString(),
                    text: question.questionText,
                    questionNumber: responseData.currentQuestionIndex + 1,
                });
                setSessionData({
                    sessionId,
                    totalQuestions: responseData.totalQuestions || 4,
                    currentQuestionNumber: responseData.currentQuestionIndex + 1,
                    timeRemaining: responseData.timeRemaining || 300,
                    isCompleted: false,
                });
                setTimeRemaining(responseData.timeRemaining || 300);
                setSelectedScore(null);
                setScreen('test');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || t('PersonalityTest.questionLoadFailed');
            const errorStatus = error?.response?.status;
            window.location.reload();
            // Handle expired session (410 Gone)
            if (errorStatus === 410 || error?.response?.data?.status === 'expired') {
                enqueueSnackbar(t('PersonalityTest.sessionExpired'), {
                    variant: 'error',
                });
                localStorage.removeItem('personality_test_session_id');
                setScreen('start');
                setSessionId(null);
                setCurrentQuestion(null);
                setSessionData(null);
                return;
            }

            // Session aktif değilse veya yetki yoksa ana ekrana dön
            if (errorMessage.includes('Test oturumu aktif değil') ||
                errorMessage.includes('Test oturumu bulunamadı') ||
                errorMessage.includes('Bu test oturumuna erişim yetkiniz yok')) {
                localStorage.removeItem('personality_test_session_id');
                setScreen('start');
                setSessionId(null);
                setCurrentQuestion(null);
                setSessionData(null);
            } else {
                enqueueSnackbar(errorMessage, {
                    variant: 'error',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!sessionId || !currentQuestion || selectedScore === null || isLoading) return;

        setIsLoading(true);
        try {
            const response = await submitAnswer(sessionId, {
                questionId: currentQuestion.id,
                score: selectedScore,
            });

            // Check if test is completed
            const responseData = response.data || response;
            if (responseData.data?.isCompleted) {
                setScreen('completed');
                localStorage.removeItem('personality_test_session_id');
                window.location.reload();
            } else {
                // Load next question
                await loadCurrentQuestion(sessionId);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || t('PersonalityTest.answerSaveFailed');
            const errorStatus = error?.response?.status;

            // Handle expired session (410 Gone)
            if (errorStatus === 410 || error?.response?.data?.status === 'expired') {
                enqueueSnackbar(t('PersonalityTest.answerSaveExpired'), {
                    variant: 'warning',
                });
                localStorage.removeItem('personality_test_session_id');
                setScreen('start');
                setSessionId(null);
                setCurrentQuestion(null);
                setSessionData(null);
                setIsLoading(false);
                window.location.reload();
                return;
            }

            // Session aktif değilse ana ekrana dön
            if (errorMessage.includes('Test oturumu aktif değil') || errorMessage.includes('Test oturumu bulunamadı')) {
                enqueueSnackbar(t('PersonalityTest.sessionEnded'), {
                    variant: 'warning',
                });
                localStorage.removeItem('personality_test_session_id');
                setScreen('start');
                setSessionId(null);
                setCurrentQuestion(null);
                setSessionData(null);
                window.location.reload();
            } else {
                enqueueSnackbar(errorMessage, {
                    variant: 'error',
                });
            }
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Start Screen
    if (screen === 'start') {
        // Show existing session info if user is not eligible
        const existingSession = eligibilityData && eligibilityData.existingSession
            ? eligibilityData.existingSession
            : null;

        // Determine alert severity and message based on session status
        const getAlertConfig = () => {
            if (!existingSession) return null;

            switch (existingSession.status) {
                case 'completed':
                    return {
                        severity: 'success' as const,
                        message: eligibilityData.message,
                        showProgress: false
                    };
                case 'expired':
                    return {
                        severity: 'warning' as const,
                        message: eligibilityData.message,
                        showProgress: true
                    };
                case 'in-progress':
                    return {
                        severity: 'info' as const,
                        message: eligibilityData.message,
                        showProgress: true
                    };
                default:
                    return null;
            }
        };

        const alertConfig = getAlertConfig();

        return (
            <>
                <Seo title={t('PersonalityTest.title')} />
                <Box
                    sx={{
                        backgroundColor: 'background.default',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Container maxWidth="sm">
                        <Card elevation={16}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={3} alignItems="center">
                                    <CheckCircleIcon
                                        sx={{ fontSize: 64, color: 'primary.main' }}
                                    />
                                    <Typography variant="h4" align="center" fontWeight="bold">
                                        {t('PersonalityTest.title')}
                                    </Typography>

                                    {/* Show alert based on session status */}
                                    {alertConfig && (
                                        <Alert severity={alertConfig.severity} sx={{ width: '100%' }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {alertConfig.message}
                                            </Typography>
                                            {alertConfig.showProgress && existingSession && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    İlerleme: {existingSession.answeredQuestions || 0} / {existingSession.totalQuestions || personalityTestQuestionCount} soru
                                                </Typography>
                                            )}
                                            {existingSession?.status === 'expired' && (
                                                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'error.main' }}>
                                                    Bu test artık tamamlanamaz.
                                                </Typography>
                                            )}
                                        </Alert>
                                    )}

                                    <Typography>
                                        {t('PersonalityTest.description')}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        color="text.secondary"
                                    >
                                        {t('PersonalityTest.subtitle', { questionCount: personalityTestQuestionCount })}
                                    </Typography>
                                    <Paper
                                        variant="outlined"
                                        sx={{ p: 2, width: '100%', bgcolor: 'background.default' }}
                                    >
                                        <Stack spacing={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                • {t('PersonalityTest.bullet1')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                • {t('PersonalityTest.bullet2')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                • {t('PersonalityTest.bullet3')}
                                            </Typography>
                                        </Stack>
                                    </Paper>

                                    {/* Button logic based on session status */}
                                    {existingSession && existingSession.status === 'in-progress' ? (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            onClick={() => {
                                                setSessionId(existingSession.id);
                                                localStorage.setItem('personality_test_session_id', existingSession.id);
                                                loadCurrentQuestion(existingSession.id);
                                            }}
                                            disabled={isLoading}
                                            sx={{ mt: 2 }}
                                        >
                                            {isLoading ? t('PersonalityTest.loading') : t('PersonalityTest.continue')}
                                        </Button>
                                    ) : existingSession && existingSession.status === 'completed' ? (
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            fullWidth
                                            disabled
                                            sx={{ mt: 2 }}
                                        >
                                            {t('PersonalityTest.testCompleted')}
                                        </Button>
                                    ) : existingSession && existingSession.status === 'expired' ? (
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            fullWidth
                                            disabled
                                            sx={{ mt: 2 }}
                                        >
                                            {t('PersonalityTest.expired')}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            onClick={handleStartTest}
                                            disabled={isLoading || isCheckingEligibility}
                                            sx={{ mt: 2 }}
                                        >
                                            {isCheckingEligibility
                                                ? t('PersonalityTest.checking')
                                                : isLoading
                                                    ? t('PersonalityTest.starting')
                                                    : t('PersonalityTest.start')}
                                        </Button>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Container>
                </Box>
            </>
        );
    }

    // Test Screen
    if (screen === 'test' && currentQuestion && sessionData) {
        const progress =
            (sessionData.currentQuestionNumber / sessionData.totalQuestions) * 100;

        return (
            <>
                <Seo title={`${t('PersonalityTest.title')} - ${t('PersonalityTest.question')} ${sessionData.currentQuestionNumber}`} />
                <Box
                    sx={{
                        backgroundColor: 'background.default',
                        minHeight: '100vh',
                        py: 4,
                    }}
                >
                    <Container maxWidth="md">
                        <Stack spacing={3}>
                            {/* Progress and Timer Header */}
                            <Paper elevation={2} sx={{ p: 2 }}>
                                <Stack spacing={2}>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Typography variant="body2" fontWeight="medium">
                                            Soru {sessionData.currentQuestionNumber} /{' '}
                                            {sessionData.totalQuestions}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AccessTimeIcon
                                                fontSize="small"
                                                color={timeRemaining < 60 ? 'error' : 'action'}
                                            />
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color={timeRemaining < 60 ? 'error.main' : 'text.primary'}
                                            >
                                                {formatTime(timeRemaining)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{ height: 8, borderRadius: 1 }}
                                    />
                                </Stack>
                            </Paper>

                            {/* Question Card */}
                            <Card elevation={4}>
                                <CardContent sx={{ p: 4 }}>
                                    <Stack spacing={4}>
                                        <Typography
                                            variant="h5"
                                            align="center"
                                            fontWeight="medium"
                                            sx={{ minHeight: 80 }}
                                        >
                                            {currentQuestion.text}
                                        </Typography>

                                        {/* Score Selection */}
                                        <Box sx={{ px: 2 }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                align="center"
                                                gutterBottom
                                            >
                                                {t('PersonalityTest.scaleText')}
                                            </Typography>
                                            <Box sx={{ px: 2, mt: 4 }}>
                                                <Slider
                                                    value={selectedScore || 5}
                                                    onChange={(_, value) =>
                                                        setSelectedScore(value as number)
                                                    }
                                                    min={1}
                                                    max={10}
                                                    step={1}
                                                    marks={Array.from({ length: 10 }, (_, i) => ({
                                                        value: i + 1,
                                                        label: (i + 1).toString(),
                                                    }))}
                                                    valueLabelDisplay="on"
                                                    sx={{
                                                        '& .MuiSlider-markLabel': {
                                                            fontSize: '0.75rem',
                                                        },
                                                        '& .MuiSlider-valueLabel': {
                                                            fontSize: '1rem',
                                                            fontWeight: 'bold',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={handleSubmitAnswer}
                                            disabled={selectedScore === null || isLoading}
                                            fullWidth
                                        >
                                            {isLoading ? t('PersonalityTest.sending') : t('PersonalityTest.next')}
                                        </Button>

                                        {selectedScore === null && (
                                            <Alert severity="info" sx={{ mt: 2 }}>
                                                {t('PersonalityTest.chooseScoreAlert')}
                                            </Alert>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Container>
                </Box>
            </>
        );
    }

    // Completion Screen
    if (screen === 'completed') {
        return (
            <>
                <Seo title={t('PersonalityTest.testFinishedTitle')} />
                <Box
                    sx={{
                        backgroundColor: 'background.default',
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        py: 8,
                    }}
                >
                    <Container maxWidth="sm">
                        <Card elevation={16}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={3} alignItems="center">
                                    <CheckCircleIcon
                                        sx={{ fontSize: 80, color: 'success.main' }}
                                    />
                                    <Typography variant="h4" align="center" fontWeight="bold">
                                        {t('PersonalityTest.testFinishedTitle')}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        color="text.secondary"
                                    >
                                        {t('PersonalityTest.thanks')}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        onClick={() => navigate('/')}
                                        sx={{ mt: 2 }}
                                    >
                                        {t('PersonalityTest.backHome')}
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Container>
                </Box>
            </>
        );
    }

    // Loading state
    return (
        <Box
            sx={{
                backgroundColor: 'background.default',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Typography>{t('PersonalityTest.loading')}</Typography>
        </Box>
    );
}

Component.displayName = 'InventoryTest';
