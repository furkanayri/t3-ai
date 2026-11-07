import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControlLabel,
    LinearProgress,
    Radio,
    RadioGroup,
    Stack,
    Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import { useStartCandidateQuizAssignmentMutation } from 'src/hooks/useServices/useUserQuizAssignments';
import {
    useGetCandidateQuizSessionQuery,
    useSubmitCandidateAnswerMutation,
    useCompleteCandidateQuizMutation,
} from 'src/hooks/useServices/useQuizSessions';

const BRAND = '#E31E24';

interface QuizOption { optionId: string; text: string }
interface QuizQuestion { _id: string; question: string; options: QuizOption[]; points?: number }

// assignmentId: Degerlendirme sureci startStage'in dondurdugu userQuizAssignment id'si.
export default function QuizTakeInline({ assignmentId, onExit }: { assignmentId: string, onExit: () => void }) {
    const { enqueueSnackbar } = useSnackbar();
    const startQuiz = useStartCandidateQuizAssignmentMutation();
    const submitAnswer = useSubmitCandidateAnswerMutation();
    const completeQuiz = useCompleteCandidateQuizMutation();

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<Record<string, string>>({});
    const [result, setResult] = useState<any>(null);
    const didStart = useRef(false);

    useEffect(() => {
        if (didStart.current) return;
        didStart.current = true;
        startQuiz
            .mutateAsync(assignmentId)
            .then((res) => {
                const sid = res?.data?.session?.sessionId;
                if (sid) setSessionId(sid);
            })
            .catch((e: any) => {
                enqueueSnackbar(e?.response?.data?.error || 'Quiz başlatılamadı', { variant: 'error' });
            });
    }, [assignmentId]);

    const sessionQuery = useGetCandidateQuizSessionQuery(sessionId || '', { enabled: !!sessionId });
    const questions: QuizQuestion[] = sessionQuery.data?.data?.questions ?? [];

    if (startQuiz.isError) {
        return (
            <Box sx={{ py: 4 }}>
                <Alert severity="error">Quiz başlatılamadı. Lütfen tekrar deneyin.</Alert>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="outlined" onClick={onExit}>Geri dön</Button>
                </Box>
            </Box>
        );
    }

    if (!sessionId || sessionQuery.isLoading) {
        return (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (result) {
        return (
            <Stack spacing={3} alignItems="center" sx={{ py: 4, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: result.isPassed ? 'success.main' : BRAND }} />
                <Typography variant="h5" fontWeight={700}>Quiz tamamlandı</Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: result.isPassed ? 'success.main' : BRAND }}>
                    %{result.scorePercentage ?? 0}
                </Typography>
                <Typography color="text.secondary">
                    {result.correctAnswers ?? 0} / {result.totalQuestions ?? questions.length} doğru
                    {' · '}
                    {result.isPassed ? 'Başarılı' : 'Geçer puana ulaşılamadı'}
                </Typography>
                <Button variant="contained" size="large" onClick={onExit}>Değerlendirme sürecine dön</Button>
            </Stack>
        );
    }

    if (questions.length === 0) {
        return (
            <Box sx={{ py: 4 }}>
                <Alert severity="info">Bu quiz için soru bulunamadı.</Alert>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="outlined" onClick={onExit}>Geri dön</Button>
                </Box>
            </Box>
        );
    }

    const question = questions[current];
    const isLast = current === questions.length - 1;
    const chosen = selected[question._id];
    const busy = submitAnswer.isLoading || completeQuiz.isLoading;

    const handleNext = async () => {
        if (!chosen || !sessionId) return;
        try {
            await submitAnswer.mutateAsync({
                sessionId,
                payload: { questionId: question._id, answer: chosen },
            });
            if (isLast) {
                const res = await completeQuiz.mutateAsync({ sessionId });
                setResult(res?.data ?? {});
            } else {
                setCurrent((c) => c + 1);
            }
        } catch (e: any) {
            enqueueSnackbar(e?.response?.data?.error || 'Cevap kaydedilemedi', { variant: 'error' });
        }
    };

    const progress = Math.round(((current) / questions.length) * 100);

    return (
        <Stack spacing={3}>
            <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Soru {current + 1} / {questions.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">%{progress}</Typography>
                </Stack>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 8, borderRadius: 999, '& .MuiLinearProgress-bar': { bgcolor: BRAND } }}
                />
            </Box>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        {question.question}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <RadioGroup
                        value={chosen ?? ''}
                        onChange={(e) => setSelected((s) => ({ ...s, [question._id]: e.target.value }))}
                    >
                        <Stack spacing={1}>
                            {question.options.map((opt) => (
                                <Box
                                    key={opt.optionId}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: chosen === opt.optionId ? BRAND : 'divider',
                                        bgcolor: chosen === opt.optionId ? 'rgba(227,30,36,0.05)' : 'transparent',
                                        borderRadius: 2,
                                        px: 2,
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <FormControlLabel
                                        value={opt.optionId}
                                        control={<Radio sx={{ '&.Mui-checked': { color: BRAND } }} />}
                                        label={opt.text}
                                        sx={{ width: '100%', py: 1, m: 0 }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Stack direction="row" justifyContent="space-between">
                <Button onClick={onExit} disabled={busy}>Çıkış</Button>
                <Button variant="contained" onClick={handleNext} disabled={!chosen || busy}>
                    {busy ? <CircularProgress size={22} color="inherit" /> : isLast ? 'Bitir' : 'Sonraki'}
                </Button>
            </Stack>
        </Stack>
    );
}
