import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';
import { useGetBatchVideoEvaluationQuery } from 'src/hooks/useServices/useInterviewServices';

interface BatchAiEvaluationCardProps {
    candidateAnswerId: string;
    answerId: string;
}

export default function BatchAiEvaluationCard({
    candidateAnswerId,
    answerId,
}: BatchAiEvaluationCardProps) {
    const theme = useTheme();
    const { t, i18n } = useTranslation();
    const evaluationQuery = useGetBatchVideoEvaluationQuery(candidateAnswerId);
    const evaluation = evaluationQuery.data?.results?.find(
        (result) => result.answerId === answerId
    );

    const handleRefresh = () => {
        void evaluationQuery.refetch();
    };

    if (evaluationQuery.isLoading) {
        return (
            <Paper variant="outlined" sx={{ mb: 2, p: 2.5, borderRadius: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={22} />
                    <Typography variant="body2" color="text.secondary">
                        {t('BatchAiEvaluation.loading')}
                    </Typography>
                </Stack>
            </Paper>
        );
    }

    if (evaluationQuery.isError) {
        return (
            <Alert
                severity="error"
                sx={{ mb: 2, borderRadius: 2 }}
                action={(
                    <Button color="inherit" size="small" onClick={handleRefresh}>
                        {t('BatchAiEvaluation.retry')}
                    </Button>
                )}
            >
                {t('BatchAiEvaluation.loadError')}
            </Alert>
        );
    }

    if (!evaluation) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    mb: 2,
                    p: 2.5,
                    borderRadius: 2,
                    borderStyle: 'dashed',
                    bgcolor: alpha(theme.palette.info.light, 0.12),
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <AutoAwesomeIcon color="info" />
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                                {t('BatchAiEvaluation.title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('BatchAiEvaluation.notReady')}
                            </Typography>
                        </Box>
                    </Stack>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={evaluationQuery.isFetching}
                    >
                        {t('BatchAiEvaluation.refresh')}
                    </Button>
                </Stack>
            </Paper>
        );
    }

    if (evaluation.status === 'FAILED') {
        return (
            <Paper
                variant="outlined"
                sx={{ mb: 2, p: 2.5, borderRadius: 2, borderColor: 'error.light' }}
            >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <ErrorOutlineIcon color="error" />
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {t('BatchAiEvaluation.title')}
                            </Typography>
                            <Chip
                                size="small"
                                color="error"
                                variant="outlined"
                                label={t('BatchAiEvaluation.failed')}
                            />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            {evaluation.diagnostics?.errors?.join(' · ') || t('BatchAiEvaluation.failedDescription')}
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={evaluationQuery.isFetching}
                    >
                        {t('BatchAiEvaluation.refresh')}
                    </Button>
                </Stack>
            </Paper>
        );
    }

    const score = evaluation.evaluationScore ?? 0;
    const scoreColor = score >= 7
        ? theme.palette.success.main
        : score >= 4
            ? theme.palette.warning.main
            : theme.palette.error.main;
    const processedAt = evaluation.processedAt
        ? new Intl.DateTimeFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(evaluation.processedAt))
        : null;

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 2.5,
                overflow: 'hidden',
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.32)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.1)} 0%, ${theme.palette.background.paper} 48%)`,
            }}
        >
            <Box sx={{ p: 2.5 }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2.5}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                >
                    <Box sx={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            size={84}
                            thickness={4}
                            sx={{ color: alpha(scoreColor, 0.16), position: 'absolute' }}
                        />
                        <CircularProgress
                            variant="determinate"
                            value={Math.max(0, Math.min(100, score * 10))}
                            size={84}
                            thickness={4}
                            sx={{ color: scoreColor, position: 'absolute' }}
                        />
                        <Box
                            sx={{
                                inset: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <Typography variant="h5" fontWeight={800} lineHeight={1}>
                                {score}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                / 10
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            sx={{ mb: 1 }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AutoAwesomeIcon color="secondary" />
                                <Typography variant="h6" fontWeight={800}>
                                    {t('BatchAiEvaluation.title')}
                                </Typography>
                            </Stack>
                            <Chip
                                size="small"
                                color="success"
                                variant="outlined"
                                label={t('BatchAiEvaluation.completed')}
                            />
                        </Stack>

                        <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.65 }}>
                            {evaluation.evaluationReasoning || t('BatchAiEvaluation.noReasoning')}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.max(0, Math.min(100, score * 10))}
                            sx={{
                                height: 7,
                                borderRadius: 999,
                                bgcolor: alpha(scoreColor, 0.13),
                                '& .MuiLinearProgress-bar': { bgcolor: scoreColor, borderRadius: 999 },
                            }}
                        />
                    </Box>
                </Stack>
            </Box>

            <Divider />

            <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ArticleOutlinedIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2">
                            {t('BatchAiEvaluation.transcript')}
                        </Typography>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pt: 0 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                    >
                        {evaluation.transcript || t('BatchAiEvaluation.noTranscript')}
                    </Typography>
                </AccordionDetails>
            </Accordion>

            <Divider />

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ px: 2.5, py: 1.5 }}
            >
                {evaluation.modelVersions?.llm && (
                    <Chip size="small" variant="outlined" label={`LLM: ${evaluation.modelVersions.llm}`} />
                )}
                {evaluation.modelVersions?.whisper && (
                    <Chip size="small" variant="outlined" label={`Whisper: ${evaluation.modelVersions.whisper}`} />
                )}
                {evaluation.diagnostics?.processingTimeSeconds !== undefined && (
                    <Chip
                        size="small"
                        variant="outlined"
                        label={`${t('BatchAiEvaluation.processingTime')}: ${evaluation.diagnostics.processingTimeSeconds} sn`}
                    />
                )}
                {processedAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' }, alignSelf: 'center' }}>
                        {t('BatchAiEvaluation.processedAt')}: {processedAt}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
}
