import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    LinearProgress,
    Radio,
    RadioGroup,
    Stack,
    Typography,
    Alert,
    Chip,
    Paper,
} from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import { Seo } from 'src/components/seo';
import { useSnackbar } from 'notistack';
import {
    useGetCandidateQuizSessionQuery,
    useSubmitCandidateAnswerMutation,
    useCompleteCandidateQuizMutation,
} from 'src/hooks/useServices';

function TakeQuiz() {
    const navigate = useNavigate();
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const { enqueueSnackbar } = useSnackbar();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: sessionData, isLoading, error } = useGetCandidateQuizSessionQuery(sessionId || '', {
        enabled: !!sessionId,
    });
    const submitAnswerMutation = useSubmitCandidateAnswerMutation();
    const completeQuizMutation = useCompleteCandidateQuizMutation();

    const session = useMemo(() => {
        if (!sessionData) return null;
        // Backend response: { success: true, data: { session: {...}, questions: {...} } }
        return sessionData?.data?.session || sessionData?.session || sessionData?.data || sessionData;
    }, [sessionData]);

    const questions = useMemo(() => {
        if (!sessionData) return [];
        // Backend'den gelen questions yapısı: { results: [...], count: 3 }
        const questionsData = sessionData?.data?.questions || sessionData?.questions;
        return questionsData?.results || questionsData || [];
    }, [sessionData]);

    const currentQuestion = questions[currentQuestionIndex];

    // LocalStorage'dan cevapları yükle
    useEffect(() => {
        if (sessionId) {
            const savedAnswers = localStorage.getItem(`quiz_answers_${sessionId}`);
            if (savedAnswers) {
                try {
                    setAnswers(JSON.parse(savedAnswers));
                } catch (e) {
                    console.error('Failed to parse saved answers', e);
                }
            }
        }
    }, [sessionId]);

    // Cevapları LocalStorage'a kaydet
    useEffect(() => {
        if (sessionId && Object.keys(answers).length > 0) {
            localStorage.setItem(`quiz_answers_${sessionId}`, JSON.stringify(answers));
        }
    }, [answers, sessionId]);

    // Timer
    useEffect(() => {
        if (!session?.timeLimit) return;

        // İlk kalan süreyi hesapla
        // Backend'den timeLimit zaten saniye cinsinden geliyor
        const startTime = new Date(session.startedAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, session.timeLimit - elapsed);

        setTimeRemaining(remaining);

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 0) {
                    clearInterval(interval);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    // Sayfa kapatma uyarısı
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleTimeUp = async () => {
        enqueueSnackbar('Süre doldu! Quiz otomatik olarak tamamlanıyor...', { variant: 'warning' });
        await handleCompleteQuiz(true);
    };

    const handleAnswerChange = async (questionId: string, optionId: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionId,
        }));

        // Backend'e cevabı kaydet
        try {
            console.log('Submitting answer:', { sessionId, questionId, optionId });
            const response = await submitAnswerMutation.mutateAsync({
                sessionId: sessionId!,
                payload: {
                    questionId,
                    answer: optionId, // Backend 'answer' field'ı bekliyor
                    timeSpent: 0,
                },
            });
            console.log('Answer submitted successfully:', response);
        } catch (error) {
            console.error('Failed to submit answer:', error);
            enqueueSnackbar('Cevap kaydedilemedi', { variant: 'error' });
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleCompleteQuiz = async (isAutoComplete = false) => {
        if (!isAutoComplete) {
            setShowCompleteDialog(false);
        }

        setIsSubmitting(true);

        try {
            // Backend zaten cevapları userQuizAnswers'dan alıyor
            const response = await completeQuizMutation.mutateAsync({
                sessionId: sessionId!
            });

            // LocalStorage'ı temizle
            localStorage.removeItem(`quiz_answers_${sessionId}`);

            enqueueSnackbar('Quiz başarıyla tamamlandı!', { variant: 'success' });

            // Sonuç sayfasına yönlendir
            navigate(`/quizzes/${assignmentId}/results?sessionId=${sessionId}`);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Quiz tamamlanırken bir hata oluştu';
            enqueueSnackbar(errorMessage, { variant: 'error' });
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(answers).length;
    const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    if (!sessionId) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Session ID bulunamadı. Lütfen quiz listesinden tekrar başlatın.
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => navigate('/quizzes')}
                    sx={{ mt: 2 }}
                >
                    Quiz Listesine Dön
                </Button>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
                <Typography align="center" sx={{ mt: 2 }}>
                    Quiz yükleniyor...
                </Typography>
            </Box>
        );
    }

    if (error || !session) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Quiz yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => navigate('/quizzes')}
                    sx={{ mt: 2 }}
                >
                    Quiz Listesine Dön
                </Button>
            </Container>
        );
    }

    if (session.status === 'completed') {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="info">
                    Bu quiz zaten tamamlanmış. Sonuçları görüntülemek için aşağıdaki butona tıklayın.
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => navigate(`/quizzes/${assignmentId}/results?sessionId=${sessionId}`)}
                    sx={{ mt: 2 }}
                >
                    Sonuçları Görüntüle
                </Button>
            </Container>
        );
    }

    return (
        <>
            <Seo title="Quiz Çözme" />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                {/* Header */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Quiz Çözme
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Soru {currentQuestionIndex + 1} / {questions.length}
                            </Typography>
                        </Box>

                        {timeRemaining !== null && (
                            <Chip
                                icon={<AccessTimeIcon />}
                                label={`Kalan Süre: ${formatTime(timeRemaining)}`}
                                color={timeRemaining < 300 ? 'error' : 'primary'}
                                sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                            />
                        )}
                    </Stack>

                    {/* Progress Bar */}
                    <Box sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                İlerleme
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {answeredCount} / {questions.length} Cevaplandı
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            sx={{ height: 8, borderRadius: 1 }}
                        />
                    </Box>
                </Paper>

                {/* Question Card */}
                {currentQuestion && (
                    <Card elevation={3}>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                {/* Question */}
                                <Box>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        {currentQuestion.question || currentQuestion.text}
                                    </Typography>
                                    {currentQuestion.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {currentQuestion.description}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Options */}
                                <FormControl component="fieldset" fullWidth>
                                    <RadioGroup
                                        value={answers[currentQuestion._id || currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQuestion._id || currentQuestion.id, e.target.value)}
                                    >
                                        {currentQuestion.options.map((option: any) => (
                                            <Paper
                                                key={option.optionId || option.id}
                                                elevation={answers[currentQuestion._id || currentQuestion.id] === (option.optionId || option.id) ? 3 : 1}
                                                sx={{
                                                    p: 2,
                                                    mb: 2,
                                                    cursor: 'pointer',
                                                    border: answers[currentQuestion._id || currentQuestion.id] === (option.optionId || option.id) ? '2px solid' : '1px solid',
                                                    borderColor: answers[currentQuestion._id || currentQuestion.id] === (option.optionId || option.id) ? 'primary.main' : 'divider',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                        boxShadow: 2,
                                                    },
                                                }}
                                            >
                                                <FormControlLabel
                                                    value={option.optionId || option.id}
                                                    control={<Radio />}
                                                    label={
                                                        <Typography variant="body1" sx={{ ml: 1 }}>
                                                            {option.text}
                                                        </Typography>
                                                    }
                                                    sx={{ m: 0, width: '100%', cursor: 'pointer' }}
                                                />
                                            </Paper>
                                        ))}
                                    </RadioGroup>
                                </FormControl>

                                {/* Answer Status */}
                                {answers[currentQuestion._id || currentQuestion.id] && (
                                    <Alert severity="success" icon={<CheckCircleIcon />}>
                                        Cevap kaydedildi
                                    </Alert>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }} spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        size="large"
                    >
                        Önceki
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => setShowCompleteDialog(true)}
                            disabled={answeredCount < questions.length || isSubmitting}
                            size="large"
                        >
                            Quiz'i Tamamla
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            onClick={handleNext}
                            size="large"
                        >
                            Sonraki
                        </Button>
                    )}
                </Stack>

                {/* Warning if not all answered */}
                {currentQuestionIndex === questions.length - 1 && answeredCount < questions.length && (
                    <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
                        Tüm soruları cevaplamadan quiz'i tamamlayamazsınız.
                        Cevaplamadığınız sorular: {questions.length - answeredCount}
                    </Alert>
                )}
            </Container>

            {/* Complete Confirmation Dialog */}
            <Dialog open={showCompleteDialog} onClose={() => setShowCompleteDialog(false)}>
                <DialogTitle>Quiz'i Tamamla</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Quiz'i tamamlamak istediğinize emin misiniz?
                        Bu işlem geri alınamaz ve cevaplarınız değerlendirmeye gönderilecektir.
                    </DialogContentText>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            • Toplam Soru: {questions.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Cevaplanan: {answeredCount}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCompleteDialog(false)} disabled={isSubmitting}>
                        İptal
                    </Button>
                    <Button
                        onClick={() => handleCompleteQuiz(false)}
                        variant="contained"
                        color="success"
                        disabled={isSubmitting}
                        autoFocus
                    >
                        {isSubmitting ? 'Tamamlanıyor...' : 'Evet, Tamamla'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export const Component = TakeQuiz;
export default TakeQuiz;
