import React, { useMemo } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    Typography,
    Alert,
    LinearProgress,
    Chip,
    Paper,
    Divider,
    Grid,
} from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';
import ListIcon from '@mui/icons-material/List';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Seo } from 'src/components/seo';
import { useGetCandidateSessionResultsQuery, useGetCandidateQuizAssignmentsQuery } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';

function QuizResults() {
    const navigate = useNavigate();
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const { user } = useAuth();

    const { data: resultsData, isLoading: resultsLoading, error: resultsError } = useGetCandidateSessionResultsQuery(
        sessionId || '',
        { enabled: !!sessionId }
    );

    const { data: assignmentsData } = useGetCandidateQuizAssignmentsQuery();

    const results = useMemo(() => {
        if (!resultsData) return null;
        const data = resultsData?.data || resultsData;
        console.log('QuizResults - Raw data:', resultsData);
        console.log('QuizResults - Processed results:', data);
        console.log('QuizResults - Session:', data?.session);
        console.log('QuizResults - isPassed:', data?.session?.isPassed);
        console.log('QuizResults - passingScore:', data?.session?.passingScore);
        return data;
    }, [resultsData]);

    const currentAssignment = useMemo(() => {
        if (!assignmentsData || !assignmentId) return null;
        const assignments = assignmentsData?.data?.results || assignmentsData?.results || [];
        return assignments.find((a: any) => a.id === assignmentId || a._id === assignmentId);
    }, [assignmentsData, assignmentId]);

    const canRetake = useMemo(() => {
        if (!currentAssignment) return false;
        return currentAssignment.attemptCount < currentAssignment.maxAttempts;
    }, [currentAssignment]);

    // Eğer sessionId yoksa ve assignment completed ise, kullanıcıyı yönlendir
    React.useEffect(() => {
        if (!sessionId && currentAssignment?.status === 'completed') {
            // Backend'den en son session'ı almak için endpoint çağırabilirsiniz
            // Şimdilik kullanıcıya sessionId gerektiğini söyleyelim
        }
    }, [sessionId, currentAssignment]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} dk ${secs} sn`;
    };

    const handleRetake = () => {
        navigate(`/quizzes`);
    };

    const handleBackToList = () => {
        navigate('/quizzes');
    };

    if (!sessionId) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Session ID bulunamadı. Lütfen quiz listesinden tekrar başlatın.
                </Alert>
                <Button variant="contained" onClick={handleBackToList} sx={{ mt: 2 }}>
                    Quiz Listesine Dön
                </Button>
            </Container>
        );
    }

    if (resultsLoading) {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
                <Typography align="center" sx={{ mt: 2 }}>
                    Sonuçlar yükleniyor...
                </Typography>
            </Box>
        );
    }

    if (resultsError || !results) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Sonuçlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
                </Alert>
                <Button variant="contained" onClick={handleBackToList} sx={{ mt: 2 }}>
                    Quiz Listesine Dön
                </Button>
            </Container>
        );
    }

    const { session, answers, quizSet } = results;
    const isPassed = session.isPassed;
    const scorePercentage = session.scorePercentage;

    return (
        <>
            <Seo title="Quiz Sonuçları" />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Success/Fail Banner */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        mb: 4,
                        textAlign: 'center',
                        background: isPassed
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                    }}
                >
                    <EmojiEventsIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {isPassed ? '🎉 Tebrikler!' : '😔 Maalesef'}
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                        {isPassed ? 'Quiz\'i Başarıyla Tamamladınız!' : 'Quiz\'i Geçemediniz'}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 'bold', mt: 2 }}>
                        %{scorePercentage}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        Geçme Notu: %{session.passingScore}
                    </Typography>
                </Paper>

                {/* Summary Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" gutterBottom>
                                    {session.totalQuestions}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Soru
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main" gutterBottom>
                                    {session.correctAnswers}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Doğru Cevap
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="error.main" gutterBottom>
                                    {session.totalQuestions - session.correctAnswers}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Yanlış Cevap
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="info.main" gutterBottom>
                                    {session.totalPoints}/{session.maxPossiblePoints}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Puan
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Additional Info */}
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    {quizSet.title}
                                </Typography>
                                {quizSet.description && (
                                    <Typography variant="body2" color="text.secondary">
                                        {quizSet.description}
                                    </Typography>
                                )}
                            </Box>
                            <Divider />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <AccessTimeIcon fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            Harcanan Süre: {formatTime(session.totalTimeSpent)}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Deneme: {session.attemptNumber}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Detailed Answers */}
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Cevaplarınızın Detayı
                </Typography>

                <Stack spacing={2}>
                    {answers.map((answer: any, index: number) => {
                        const isCorrect = answer.isCorrect;
                        return (
                            <Card
                                key={answer.questionId}
                                sx={{
                                    border: '2px solid',
                                    borderColor: isCorrect ? 'success.main' : 'error.main',
                                }}
                            >
                                <CardContent>
                                    <Stack spacing={2}>
                                        {/* Question Header */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Chip
                                                    label={`Soru ${index + 1}`}
                                                    size="small"
                                                    sx={{ mb: 1 }}
                                                />
                                                <Typography variant="h6" gutterBottom>
                                                    {answer.question}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                                                label={isCorrect ? 'Doğru' : 'Yanlış'}
                                                color={isCorrect ? 'success' : 'error'}
                                            />
                                        </Stack>

                                        <Divider />

                                        {/* Options */}
                                        {answer.options && answer.options.length > 0 ? (
                                            <Stack spacing={1}>
                                                {answer.options.map((option: any) => {
                                                    const isSelected = option.id === answer.selectedOptionId;
                                                    const isCorrectOption = option.isCorrect;

                                                    return (
                                                        <Paper
                                                            key={option.id}
                                                            elevation={isSelected || isCorrectOption ? 2 : 0}
                                                            sx={{
                                                                p: 2,
                                                                border: '2px solid',
                                                                borderColor: isSelected
                                                                    ? isCorrectOption
                                                                        ? 'success.main'
                                                                        : 'error.main'
                                                                    : isCorrectOption
                                                                        ? 'success.light'
                                                                        : 'divider',
                                                                backgroundColor: isSelected
                                                                    ? isCorrectOption
                                                                        ? 'success.lighter'
                                                                        : 'error.lighter'
                                                                    : isCorrectOption
                                                                        ? 'success.lighter'
                                                                        : 'transparent',
                                                            }}
                                                        >
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                {isCorrectOption && (
                                                                    <CheckCircleIcon color="success" fontSize="small" />
                                                                )}
                                                                {isSelected && !isCorrectOption && (
                                                                    <CancelIcon color="error" fontSize="small" />
                                                                )}
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{
                                                                        fontWeight: isSelected || isCorrectOption ? 'bold' : 'normal',
                                                                    }}
                                                                >
                                                                    {option.text}
                                                                </Typography>
                                                                {isSelected && (
                                                                    <Chip
                                                                        label="Sizin Cevabınız"
                                                                        size="small"
                                                                        color={isCorrectOption ? 'success' : 'error'}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </Paper>
                                                    );
                                                })}
                                            </Stack>
                                        ) : (
                                            <Box>
                                                <Alert
                                                    severity={isCorrect ? 'success' : 'error'}
                                                    icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                                                >
                                                    <Typography variant="body2">
                                                        <strong>Sizin Cevabınız:</strong> {answer.selectedOptionText}
                                                    </Typography>
                                                    {!isCorrect && (
                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                            <strong>Doğru Cevap:</strong> {answer.correctOptionText}
                                                        </Typography>
                                                    )}
                                                </Alert>
                                            </Box>
                                        )}

                                        {/* Points and Time */}
                                        <Stack direction="row" spacing={3}>
                                            <Typography variant="body2" color="text.secondary">
                                                Kazanılan Puan: {answer.earnedPoints}
                                            </Typography>
                                            {answer.timeSpent && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Süre: {answer.timeSpent} saniye
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ListIcon />}
                        onClick={handleBackToList}
                        size="large"
                    >
                        Quiz Listesine Dön
                    </Button>
                    {canRetake && !isPassed && (
                        <Button
                            variant="contained"
                            startIcon={<ReplayIcon />}
                            onClick={handleRetake}
                            size="large"
                        >
                            Tekrar Dene ({currentAssignment.maxAttempts - currentAssignment.attemptCount} hak kaldı)
                        </Button>
                    )}
                </Stack>

                {!canRetake && !isPassed && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Deneme hakkınız kalmadı. Lütfen yöneticinizle iletişime geçin.
                    </Alert>
                )}
            </Container>
        </>
    );
}

export const Component = QuizResults;
export default QuizResults;
