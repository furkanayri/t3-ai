import React, { useMemo } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Stack,
    Typography,
    LinearProgress,
    Alert,
    Grid,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import QuizIcon from '@mui/icons-material/Quiz';
import { useAuth } from 'src/providers';
import { useGetCandidateQuizAssignmentsQuery, useStartCandidateQuizAssignmentMutation } from 'src/hooks/useServices';
import { useNavigate } from 'react-router';
import { Seo } from 'src/components/seo';
import { useSnackbar } from 'notistack';

interface QuizAssignment {
    _id: string;
    id?: string; // Bazı response'larda id olarak da gelebilir
    userId: string;
    quizSetId: string;
    status: 'assigned' | 'pending' | 'started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
    dueDate?: string;
    note?: string;
    attemptCount?: number;
    attempts?: number; // Backend attempts kullanıyor olabilir
    maxAttempts?: number;
    bestScore?: number;
    bestScorePercentage?: number;
    lastAttemptedAt?: string;
    completedAt?: string;
    createdAt: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    quizSet?: {
        id?: string;
        _id?: string;
        title: string;
        description?: string;
        timeLimit?: number;
        passingScore?: number;
        totalQuestions?: number;
        maxAttempts?: number; // maxAttempts quizSet içinde olabilir
    };
}

function QuizList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { data, isLoading, error } = useGetCandidateQuizAssignmentsQuery();
    const startQuizMutation = useStartCandidateQuizAssignmentMutation();

    const assignments: QuizAssignment[] = useMemo(() => {
        if (!data) return [];
        const results = data?.data?.results || data?.results || data?.data || [];
        return results;
    }, [data]);

    const handleStartQuiz = async (assignmentId: string) => {
        try {
            const response = await startQuizMutation.mutateAsync(assignmentId);
            // Backend response: { success: true, data: { session: {...}, quizSet: {...} } }
            const sessionId = response?.data?.session?.sessionId || response?.session?.sessionId || response?.sessionId;

            if (sessionId) {
                navigate(`/quizzes/${assignmentId}/take?sessionId=${sessionId}`);
            } else {
                enqueueSnackbar('Quiz başlatılırken bir hata oluştu: Session ID bulunamadı', { variant: 'error' });
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Quiz başlatılırken bir hata oluştu';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    };

    const handleViewResults = (assignmentId: string) => {
        // Backend'den son session ID'yi al veya assignment detayından
        // Şimdilik basit versiyonu: results sayfası assignment'tan son session'ı çeksin
        navigate(`/quizzes/${assignmentId}/results`);
    };

    const getStatusInfo = (assignment: QuizAssignment) => {
        switch (assignment.status) {
            case 'assigned':
            case 'pending':
                return {
                    label: 'Atandı',
                    color: 'warning' as const,
                    icon: <AccessTimeIcon fontSize="small" />,
                };
            case 'started':
            case 'in_progress':
                return {
                    label: 'Devam Ediyor',
                    color: 'info' as const,
                    icon: <PlayArrowIcon fontSize="small" />,
                };
            case 'completed':
                return {
                    label: 'Tamamlandı',
                    color: 'success' as const,
                    icon: <AssessmentIcon fontSize="small" />,
                };
            case 'overdue':
                return {
                    label: 'Süresi Doldu',
                    color: 'error' as const,
                    icon: <EventIcon fontSize="small" />,
                };
            case 'cancelled':
                return {
                    label: 'İptal Edildi',
                    color: 'default' as const,
                    icon: undefined,
                };
            default:
                return {
                    label: assignment.status,
                    color: 'default' as const,
                    icon: undefined,
                };
        }
    };

    const isOverdue = (dueDate?: string) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const canStartQuiz = (assignment: QuizAssignment) => {
        const attemptCount = assignment.attemptCount ?? assignment.attempts ?? 0;
        const maxAttempts = assignment.maxAttempts ?? assignment.quizSet?.maxAttempts ?? 3;
        if (assignment.status === 'completed') return false;
        if (attemptCount >= maxAttempts) return false;
        if (isOverdue(assignment.dueDate)) return false;
        return true;
    };

    if (isLoading) {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Quiz listesi yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                </Alert>
            </Container>
        );
    }

    return (
        <>
            <Seo title="Quiz Listesi" />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                        <QuizIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1">
                            Quiz Listesi
                        </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary">
                        Size atanan quiz'leri görüntüleyin ve çözün
                    </Typography>
                </Box>

                {assignments.length === 0 ? (
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <QuizIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Henüz size atanmış quiz bulunmuyor
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Size yeni bir quiz atandığında burada görünecektir
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {assignments.map((assignment) => {
                            const statusInfo = getStatusInfo(assignment);
                            const overdue = isOverdue(assignment.dueDate);
                            const assignmentId = assignment._id || assignment.id;
                            const attemptCount = assignment.attemptCount ?? assignment.attempts ?? 0;
                            const maxAttempts = assignment.maxAttempts ?? assignment.quizSet?.maxAttempts ?? 3;

                            return (
                                <Grid item xs={12} md={6} key={assignmentId}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            border: overdue && assignment.status !== 'completed' ? '2px solid' : '1px solid',
                                            borderColor: overdue && assignment.status !== 'completed' ? 'error.main' : 'divider',
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            {/* Header */}
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h6" gutterBottom>
                                                        {assignment.quizSet?.title || 'Quiz'}
                                                    </Typography>
                                                    {assignment.quizSet?.description && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {assignment.quizSet.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Chip
                                                    label={statusInfo.label}
                                                    color={statusInfo.color}
                                                    size="small"
                                                    icon={statusInfo.icon}
                                                    sx={{ ml: 1 }}
                                                />
                                            </Stack>

                                            {/* Warning for overdue */}
                                            {overdue && assignment.status !== 'completed' && (
                                                <Alert severity="error" sx={{ mb: 2 }}>
                                                    Bu quiz'in son teslim tarihi geçmiştir!
                                                </Alert>
                                            )}

                                            {/* Quiz Info */}
                                            <Stack spacing={1.5} sx={{ mb: 2 }}>
                                                {assignment.quizSet?.totalQuestions && (
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <QuizIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {assignment.quizSet.totalQuestions} Soru
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                {assignment.quizSet?.timeLimit && (
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Süre: {assignment.quizSet.timeLimit} dakika
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                {assignment.quizSet?.passingScore !== undefined && (
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <AssessmentIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Geçme Puanı: {assignment.quizSet.passingScore}%
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                {assignment.dueDate && (
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <EventIcon fontSize="small" color={overdue ? 'error' : 'action'} />
                                                        <Typography
                                                            variant="body2"
                                                            color={overdue ? 'error' : 'text.secondary'}
                                                        >
                                                            Son Tarih: {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}
                                                            {!overdue && ` (${formatDistanceToNow(new Date(assignment.dueDate), {
                                                                addSuffix: true,
                                                                locale: tr
                                                            })})`}
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Deneme Hakkı: {attemptCount} / {maxAttempts}
                                                    </Typography>
                                                </Stack>

                                                {(assignment.bestScore !== undefined && assignment.bestScore !== null) ||
                                                    (assignment.bestScorePercentage !== undefined && assignment.bestScorePercentage !== null) ? (
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                            En İyi Puan: {assignment.bestScorePercentage ?? assignment.bestScore ?? 0}%
                                                        </Typography>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={assignment.bestScorePercentage ?? assignment.bestScore ?? 0}
                                                            color={
                                                                (assignment.bestScorePercentage ?? assignment.bestScore ?? 0) >= (assignment.quizSet?.passingScore || 70)
                                                                    ? 'success'
                                                                    : 'error'
                                                            }
                                                            sx={{ height: 8, borderRadius: 1 }}
                                                        />
                                                    </Box>
                                                ) : null}
                                            </Stack>

                                            {/* Note */}
                                            {assignment.note && (
                                                <Alert severity="info" sx={{ mt: 2 }}>
                                                    {assignment.note}
                                                </Alert>
                                            )}
                                        </CardContent>

                                        {/* Actions */}
                                        <Box sx={{ p: 2, pt: 0 }}>
                                            <Stack direction="row" spacing={1}>
                                                {assignment.status === 'completed' ? (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<AssessmentIcon />}
                                                        onClick={() => handleViewResults(assignmentId!)}
                                                    >
                                                        Sonuçları Görüntüle
                                                    </Button>
                                                ) : (
                                                    <>
                                                        {canStartQuiz(assignment) ? (
                                                            <Button
                                                                variant="contained"
                                                                fullWidth
                                                                startIcon={<PlayArrowIcon />}
                                                                onClick={() => handleStartQuiz(assignmentId!)}
                                                                disabled={startQuizMutation.isLoading}
                                                            >
                                                                {assignment.status === 'in_progress' ? 'Devam Et' : 'Quiz\'i Başlat'}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outlined"
                                                                fullWidth
                                                                disabled
                                                            >
                                                                {overdue
                                                                    ? 'Süresi Doldu'
                                                                    : attemptCount >= maxAttempts
                                                                        ? 'Deneme Hakkı Kalmadı'
                                                                        : 'Başlatılamıyor'}
                                                            </Button>
                                                        )}
                                                        {assignment.status === 'in_progress' && attemptCount > 0 && (
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<AssessmentIcon />}
                                                                onClick={() => handleViewResults(assignmentId!)}
                                                            >
                                                                Sonuçlar
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>
        </>
    );
}

export default QuizList;
