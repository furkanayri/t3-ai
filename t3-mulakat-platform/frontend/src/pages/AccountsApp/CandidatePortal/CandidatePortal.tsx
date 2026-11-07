import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    LinearProgress,
    Stack,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepLabel,
    Stepper,
    Typography,
    styled,
} from '@mui/material';
import type { StepIconProps } from '@mui/material/StepIcon';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Analytics01Icon, Mic01Icon, UserIcon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/providers';
import { useCheckEligibility } from 'src/hooks/useServices/usePersonelityTest';
import { useGetMyAssessmentQuery, useGetMyAssessmentsQuery, useStartAssessmentStageMutation } from 'src/hooks/useServices/useAssessmentServices';
import { Component as InventoryTest } from '../InventoryTest/InventoryTest';
import InterviewProvider from '../Interviews/InterviewContext/InterviewProvider';
import Interviews from '../Interviews/components/Interviews';
import InterviewTakeInline from './InterviewTakeInline';
import QuizTakeInline from './QuizTakeInline';

type View = 'stepper' | 'test' | 'interview';

type SessionStatus = 'completed' | 'expired' | 'in-progress' | undefined;

const BRAND = '#E31E24';

const personalityTestQuestionCount = Number(import.meta.env.VITE_PERSONALITY_TEST_QUESTION_LIMIT) || 64;

const RedConnector = styled(StepConnector)(() => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 19,
    },
    [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
        borderColor: BRAND,
    },
    [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
        borderColor: BRAND,
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#e0e0e0',
        borderTopWidth: 2,
        borderRadius: 1,
    },
}));

const stepIcons: Record<string, React.ReactNode> = {
    1: <UserIcon size={20} />,
    2: <Analytics01Icon size={20} />,
    3: <Mic01Icon size={20} />,
    4: <CheckCircleIcon sx={{ fontSize: 20 }} />,
};

function StepIcon(props: StepIconProps) {
    const { active, completed, icon } = props;
    return (
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: active || completed ? BRAND : '#e9e9e9',
                color: active || completed ? '#fff' : '#9e9e9e',
                boxShadow: active ? '0 6px 14px rgba(227,30,36,0.35)' : 'none',
                transition: 'all 0.2s ease',
            }}
        >
            {completed ? <CheckIcon sx={{ fontSize: 20 }} /> : stepIcons[String(icon)]}
        </Box>
    );
}

function InlineActiveContent({ title, onBack, children }: { title: string, onBack: () => void, children: React.ReactNode }) {
    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Button onClick={onBack} startIcon={<ArrowBackIcon />} size="small">
                    {title}
                </Button>
            </Stack>
            {children}
        </Box>
    );
}

function WelcomePanel({ name }: { name?: string }) {
    const { t } = useTranslation();
    return (
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 2 }}>
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(227,30,36,0.1)',
                    color: BRAND,
                }}
            >
                <UserIcon size={30} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
                {t('CandidatePortal.welcomeTitle', { name: name ? ` ${name}` : '' })}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
                {t('CandidatePortal.welcomeDesc')}
            </Typography>
        </Stack>
    );
}

function StatusChip({ status }: { status: SessionStatus }) {
    const { t } = useTranslation();

    const config = {
        completed: { icon: <CheckCircleIcon />, label: t('CandidatePortal.statusCompleted'), fg: '#15803d', bg: 'rgba(22,163,74,0.12)' },
        expired: { icon: <ErrorOutlineIcon />, label: t('CandidatePortal.statusExpired'), fg: '#b91c1c', bg: 'rgba(220,38,38,0.12)' },
        'in-progress': { icon: <HourglassTopIcon />, label: t('CandidatePortal.statusInProgress'), fg: '#1d4ed8', bg: 'rgba(37,99,235,0.12)' },
        notStarted: { icon: <RadioButtonUncheckedIcon />, label: t('CandidatePortal.statusNotStarted'), fg: '#64748b', bg: 'rgba(100,116,139,0.12)' },
    } as const;

    const c = config[status ?? 'notStarted'] ?? config.notStarted;

    return (
        <Chip
            icon={c.icon}
            label={c.label}
            sx={{
                height: 30,
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 13,
                color: c.fg,
                bgcolor: c.bg,
                pl: 0.5,
                pr: 1.25,
                '& .MuiChip-icon': { color: c.fg, fontSize: 18, ml: 0.25, mr: -0.25 },
                '& .MuiChip-label': { px: 1 },
            }}
        />
    );
}

function BulletRow({ text }: { text: string }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
                sx={{
                    mt: '3px',
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'rgba(227,30,36,0.12)',
                    color: BRAND,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CheckIcon sx={{ fontSize: 13 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
                {text}
            </Typography>
        </Stack>
    );
}

function PersonalityTestPanel({ status, loading, message, session, onStart }: { status: SessionStatus, loading: boolean, message?: string, session?: any, onStart: () => void }) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    const total = session?.totalQuestions || personalityTestQuestionCount;
    const answered = session?.answeredQuestions ?? 0;
    const progress = total ? Math.round((answered / total) * 100) : 0;

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: 52,
                            height: 52,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(227,30,36,0.1)',
                            color: BRAND,
                        }}
                    >
                        <Analytics01Icon size={26} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                        {t('PersonalityTest.title')}
                    </Typography>
                </Stack>
                <StatusChip status={status} />
            </Stack>

            {message && (
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            )}

            <Box
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'rgba(227,30,36,0.03)',
                    p: { xs: 2.5, md: 3 },
                }}
            >
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    {t('PersonalityTest.subtitle', { questionCount: total })}
                </Typography>
                <Stack spacing={1.25}>
                    <BulletRow text={t('PersonalityTest.bullet1')} />
                    <BulletRow text={t('PersonalityTest.bullet2')} />
                    <BulletRow text={t('PersonalityTest.bullet3')} />
                </Stack>
            </Box>

            {status === 'in-progress' && (
                <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {t('CandidatePortal.statusInProgress')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {answered} / {total}
                        </Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 1 }}
                    />
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {status === 'in-progress' ? (
                    <Button variant="contained" size="large" onClick={onStart}>
                        {t('PersonalityTest.continue')}
                    </Button>
                ) : status === 'completed' ? (
                    <Button variant="outlined" size="large" disabled>
                        {t('PersonalityTest.testCompleted')}
                    </Button>
                ) : status === 'expired' ? (
                    <Button variant="outlined" size="large" disabled>
                        {t('PersonalityTest.expired')}
                    </Button>
                ) : (
                    <Button variant="contained" size="large" onClick={onStart}>
                        {t('PersonalityTest.start')}
                    </Button>
                )}
            </Box>
        </Stack>
    );
}

function InterviewsPanel({ onSelect }: { onSelect: (interview: any) => void }) {
    return (
        <InterviewProvider>
            <Interviews onInterviewClick={onSelect} />
        </InterviewProvider>
    );
}

function DonePanel() {
    const { t } = useTranslation();
    return (
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main' }} />
            <Typography variant="h5" fontWeight={700}>
                {t('CandidatePortal.doneTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
                {t('CandidatePortal.doneDesc')}
            </Typography>
        </Stack>
    );
}

const LegacyFlow = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [view, setView] = useState<View>('stepper');
    const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
    const [interviewsKey, setInterviewsKey] = useState(0);

    const eligibility = useCheckEligibility();
    const status: SessionStatus = eligibility.data?.existingSession?.status;
    const testCompleted = status === 'completed';

    const steps = [
        t('CandidatePortal.stepWelcome'),
        t('PersonalityTest.title'),
        t('interviews'),
        t('CandidatePortal.stepDone'),
    ];

    // Advance to Interviews only once (on first load or right after the test is
    // completed). After that the user can freely navigate back with "Geri".
    const didInit = useRef(false);
    const didAutoAdvance = useRef(false);
    useEffect(() => {
        if (didInit.current || eligibility.isLoading) return;
        didInit.current = true;
        if (testCompleted) {
            didAutoAdvance.current = true;
            setActiveStep(2);
        }
    }, [eligibility.isLoading, testCompleted]);

    // Auto-advance to Interviews the first time the test becomes completed.
    useEffect(() => {
        if (testCompleted && activeStep === 1 && !didAutoAdvance.current) {
            didAutoAdvance.current = true;
            setActiveStep(2);
        }
    }, [testCompleted, activeStep]);

    const returnToStepper = useCallback(() => {
        setView('stepper');
        setSelectedInterviewId(null);
        setInterviewsKey((prev) => prev + 1);
    }, []);

    const handleSelectInterview = useCallback((interview: any) => {
        setSelectedInterviewId(interview?._id ?? null);
        setView('interview');
    }, []);

    const activeContent = view !== 'stepper';
    const isLastStep = activeStep === steps.length - 1;
    const primaryLabel =
        activeStep === 0 ? t('CandidatePortal.welcomeStart')
            : activeStep === 2 ? t('CandidatePortal.finish')
                : t('CandidatePortal.next');
    const primaryDisabled = activeStep === 1 && !testCompleted;

    const renderPanel = () => {
        switch (activeStep) {
            case 0:
                return <WelcomePanel name={user?.name} />;
            case 1:
                if (view === 'test') {
                    return (
                        <InlineActiveContent title={t('CandidatePortal.back')} onBack={returnToStepper}>
                            <InventoryTest embedded onExit={returnToStepper} />
                        </InlineActiveContent>
                    );
                }
                return (
                    <PersonalityTestPanel
                        status={status}
                        loading={eligibility.isLoading}
                        message={eligibility.data?.message}
                        session={eligibility.data?.existingSession}
                        onStart={() => setView('test')}
                    />
                );
            case 2:
                if (view === 'interview' && selectedInterviewId) {
                    return (
                        <InlineActiveContent title={t('CandidatePortal.back')} onBack={returnToStepper}>
                            <InterviewTakeInline interviewId={selectedInterviewId} onExit={returnToStepper} />
                        </InlineActiveContent>
                    );
                }
                return <InterviewsPanel key={interviewsKey} onSelect={handleSelectInterview} />;
            default:
                return <DonePanel />;
        }
    };

    return (
        <>
            <Seo title={t('PersonalityTest.title')} />
            <Container maxWidth={activeContent ? 'lg' : 'md'} sx={{ py: { xs: 2, md: 4 } }}>
                <Stepper alternativeLabel activeStep={activeStep} connector={<RedConnector />} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Card variant="outlined" sx={{ borderRadius: 4, boxShadow: '0px 8px 30px rgba(15,23,42,0.06)' }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                        {renderPanel()}

                        {!activeContent && activeStep === 2 && !testCompleted && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                {t('CandidatePortal.interviewsLockedHint')}
                            </Alert>
                        )}

                        {!activeContent && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
                            <Button
                                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                                disabled={activeStep === 0}
                                startIcon={<ArrowBackIcon />}
                                sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                            >
                                {t('CandidatePortal.back')}
                            </Button>
                            {!isLastStep && (
                                <Button
                                    variant="contained"
                                    onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
                                    disabled={primaryDisabled}
                                >
                                    {primaryLabel}
                                </Button>
                            )}
                        </Stack>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

// ---- Dinamik Degerlendirme Sureci akisi ----

type StageStatus = 'locked' | 'pending' | 'in-progress' | 'completed' | 'expired';

interface AssessmentStageVM {
    stageId: string;
    type: 'personality_test' | 'text_interview' | 'video_interview' | 'quiz';
    title?: string;
    refId?: string;
    required: boolean;
    status: StageStatus;
    locked: boolean;
    refInstanceId?: string | null;
}

const stageIconNode = (type: AssessmentStageVM['type']) => {
    switch (type) {
        case 'personality_test': return <Analytics01Icon size={20} />;
        case 'text_interview':
        case 'video_interview': return <Mic01Icon size={20} />;
        case 'quiz': return <AssignmentTurnedInIcon sx={{ fontSize: 20 }} />;
        default: return <UserIcon size={20} />;
    }
};

const toSessionStatus = (status: StageStatus): SessionStatus => {
    if (status === 'completed') return 'completed';
    if (status === 'expired') return 'expired';
    if (status === 'in-progress') return 'in-progress';
    return undefined;
};

function DynamicStepIcon(icons: React.ReactNode[]) {
    return function Inner(props: StepIconProps) {
        const { active, completed, icon } = props;
        const idx = Number(icon) - 1;
        return (
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: active || completed ? BRAND : '#e9e9e9',
                    color: active || completed ? '#fff' : '#9e9e9e',
                    boxShadow: active ? '0 6px 14px rgba(227,30,36,0.35)' : 'none',
                    transition: 'all 0.2s ease',
                }}
            >
                {completed ? <CheckIcon sx={{ fontSize: 20 }} /> : icons[idx]}
            </Box>
        );
    };
}

function AssessmentStagePanel({ stage, onStart }: { stage: AssessmentStageVM, onStart: () => void }) {
    const { t } = useTranslation();
    const title = stage.title || t('PersonalityTest.title');

    const cta = () => {
        if (stage.locked) {
            return <Button variant="outlined" size="large" disabled>{t('CandidatePortal.statusNotStarted')}</Button>;
        }
        if (stage.status === 'completed') {
            return <Button variant="outlined" size="large" disabled>{t('CandidatePortal.statusCompleted')}</Button>;
        }
        if (stage.status === 'expired') {
            return <Button variant="outlined" size="large" disabled>{t('CandidatePortal.statusExpired')}</Button>;
        }
        return (
            <Button variant="contained" size="large" onClick={onStart}>
                {stage.status === 'in-progress' ? t('PersonalityTest.continue') : t('PersonalityTest.start')}
            </Button>
        );
    };

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: 52,
                            height: 52,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(227,30,36,0.1)',
                            color: BRAND,
                        }}
                    >
                        {stageIconNode(stage.type)}
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                        {title}
                    </Typography>
                </Stack>
                <StatusChip status={toSessionStatus(stage.status)} />
            </Stack>

            {stage.locked && (
                <Alert severity="info">{t('CandidatePortal.interviewsLockedHint')}</Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {cta()}
            </Box>
        </Stack>
    );
}

// ---- Liste / kart gorunumu ----

type AssignmentSummaryStatus = 'assigned' | 'in-progress' | 'completed' | 'expired' | 'cancelled';

interface AssessmentSummaryVM {
    id: string;
    processTitle: string;
    processDescription?: string;
    status: AssignmentSummaryStatus;
    sequential: boolean;
    totalStages: number;
    completedStages: number;
    stageTypes: AssessmentStageVM['type'][];
    dueDate?: string | null;
    assignedAt?: string | null;
}

const summaryToSessionStatus = (status: AssignmentSummaryStatus): SessionStatus => {
    if (status === 'completed') return 'completed';
    if (status === 'expired' || status === 'cancelled') return 'expired';
    if (status === 'in-progress') return 'in-progress';
    return undefined;
};

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
};

function AssessmentProcessCard({ item, onClick }: { item: AssessmentSummaryVM, onClick: () => void }) {
    const { t } = useTranslation();
    const isCompleted = item.status === 'completed';
    const progress = item.totalStages ? Math.round((item.completedStages / item.totalStages) * 100) : 0;
    const due = formatDate(item.dueDate);

    const ctaLabel = isCompleted
        ? t('CandidatePortal.cardOpen')
        : item.status === 'in-progress'
            ? t('CandidatePortal.cardContinue')
            : t('CandidatePortal.cardStart');

    const uniqueTypes = Array.from(new Set(item.stageTypes));

    return (
        <Card
            variant="outlined"
            onClick={onClick}
            sx={{
                height: '100%',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                borderColor: isCompleted ? 'rgba(22,163,74,0.4)' : 'divider',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 12px 30px rgba(15,23,42,0.1)',
                    borderColor: isCompleted ? 'rgba(22,163,74,0.6)' : BRAND,
                },
            }}
        >
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} sx={{ mb: 2 }}>
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isCompleted ? 'rgba(22,163,74,0.12)' : 'rgba(227,30,36,0.1)',
                            color: isCompleted ? '#15803d' : BRAND,
                        }}
                    >
                        <AssignmentOutlinedIcon />
                    </Box>
                    <StatusChip status={summaryToSessionStatus(item.status)} />
                </Stack>

                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3, mb: 0.5 }}>
                    {item.processTitle}
                </Typography>
                {item.processDescription && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {item.processDescription}
                    </Typography>
                )}

                <Stack direction="row" spacing={1} sx={{ mb: 2, color: 'text.secondary' }}>
                    {uniqueTypes.map((type) => (
                        <Box
                            key={type}
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(100,116,139,0.1)',
                                color: 'text.secondary',
                            }}
                        >
                            {stageIconNode(type)}
                        </Box>
                    ))}
                </Stack>

                <Box sx={{ mt: 'auto' }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {t('CandidatePortal.cardProgress', { done: item.completedStages, total: item.totalStages })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">%{progress}</Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 999,
                            '& .MuiLinearProgress-bar': { bgcolor: isCompleted ? '#15803d' : BRAND },
                        }}
                    />

                    {due && (
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.5, color: 'text.secondary' }}>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
                            <Typography variant="caption">
                                {t('CandidatePortal.dueDate')}: {due}
                            </Typography>
                        </Stack>
                    )}

                    <Button
                        fullWidth
                        variant={isCompleted ? 'outlined' : 'contained'}
                        endIcon={<ChevronRightIcon />}
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        sx={{ mt: 2.5 }}
                    >
                        {ctaLabel}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

const AssessmentList = ({ assignments, onSelect }: { assignments: AssessmentSummaryVM[], onSelect: (id: string) => void }) => {
    const { t } = useTranslation();

    return (
        <>
            <Seo title={t('CandidatePortal.listTitle')} />
            <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
                <Stack spacing={0.5} sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800}>
                        {t('CandidatePortal.listTitle')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('CandidatePortal.listSubtitle')}
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    }}
                >
                    {assignments.map((item) => (
                        <AssessmentProcessCard key={item.id} item={item} onClick={() => onSelect(item.id)} />
                    ))}
                </Box>
            </Container>
        </>
    );
};

const AssessmentFlow = ({ assignment, stages, refetch, onBack }: { assignment: any, stages: AssessmentStageVM[], refetch: () => void, onBack?: () => void }) => {
    const { t } = useTranslation();
    const startStage = useStartAssessmentStageMutation();

    const [activeStep, setActiveStep] = useState(0);
    const [view, setView] = useState<'stepper' | 'active'>('stepper');
    const [activeStage, setActiveStage] = useState<{ type: AssessmentStageVM['type'], refInstanceId?: string | null } | null>(null);

    const steps = [t('CandidatePortal.stepWelcome'), ...stages.map((s) => s.title || t('PersonalityTest.title')), t('CandidatePortal.stepDone')];
    const stepIconNodes: React.ReactNode[] = [<UserIcon key="w" size={20} />, ...stages.map((s) => stageIconNode(s.type)), <CheckCircleIcon key="d" sx={{ fontSize: 20 }} />];
    const DynIcon = DynamicStepIcon(stepIconNodes);

    // Ilk yuklemede ilk tamamlanmamis asamaya konumlan
    const didInit = useRef(false);
    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;
        const firstIncomplete = stages.findIndex((s) => s.status !== 'completed');
        if (firstIncomplete === -1) setActiveStep(stages.length + 1);
        else setActiveStep(firstIncomplete + 1);
    }, [stages]);

    const backToStepper = useCallback(() => {
        setView('stepper');
        setActiveStage(null);
        refetch();
    }, [refetch]);

    const handleStart = (stage: AssessmentStageVM) => {
        if (stage.type === 'personality_test') {
            setActiveStage({ type: stage.type, refInstanceId: null });
            setView('active');
            return;
        }
        startStage.mutateAsync({ assignmentId: assignment.id, stageId: stage.stageId }, {
            onSuccess: (data) => {
                setActiveStage({ type: stage.type, refInstanceId: data?.refInstanceId ?? null });
                setView('active');
            },
        });
    };

    const activeContent = view !== 'stepper';
    const isWelcome = activeStep === 0;
    const isDone = activeStep === steps.length - 1;
    const currentStage = !isWelcome && !isDone ? stages[activeStep - 1] : null;
    const primaryDisabled = Boolean(currentStage && currentStage.required && currentStage.status !== 'completed');

    const renderActive = () => {
        if (!activeStage) return null;
        if (activeStage.type === 'personality_test') {
            return (
                <InlineActiveContent title={t('CandidatePortal.back')} onBack={backToStepper}>
                    <InventoryTest embedded onExit={backToStepper} />
                </InlineActiveContent>
            );
        }
        if ((activeStage.type === 'text_interview' || activeStage.type === 'video_interview') && activeStage.refInstanceId) {
            return (
                <InlineActiveContent title={t('CandidatePortal.back')} onBack={backToStepper}>
                    <InterviewTakeInline interviewId={activeStage.refInstanceId} onExit={backToStepper} />
                </InlineActiveContent>
            );
        }
        if (activeStage.type === 'quiz' && activeStage.refInstanceId) {
            return (
                <InlineActiveContent title={t('CandidatePortal.back')} onBack={backToStepper}>
                    <QuizTakeInline assignmentId={activeStage.refInstanceId} onExit={backToStepper} />
                </InlineActiveContent>
            );
        }
        return null;
    };

    const renderPanel = () => {
        if (isWelcome) return <WelcomePanel />;
        if (isDone) return <DonePanel />;
        if (activeContent) return renderActive();
        if (currentStage) return <AssessmentStagePanel stage={currentStage} onStart={() => handleStart(currentStage)} />;
        return null;
    };

    return (
        <>
            <Seo title={assignment.processTitle || t('PersonalityTest.title')} />
            <Container maxWidth={activeContent ? 'lg' : 'md'} sx={{ py: { xs: 2, md: 4 } }}>
                {onBack && !activeContent && (
                    <Button
                        onClick={onBack}
                        startIcon={<ArrowBackIcon />}
                        sx={{ mb: 2, color: 'text.secondary' }}
                    >
                        {t('CandidatePortal.backToList')}
                    </Button>
                )}
                <Stepper alternativeLabel activeStep={activeStep} connector={<RedConnector />} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel StepIconComponent={DynIcon}>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Card variant="outlined" sx={{ borderRadius: 4, boxShadow: '0px 8px 30px rgba(15,23,42,0.06)' }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                        {renderPanel()}

                        {!activeContent && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
                                <Button
                                    onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                                    disabled={activeStep === 0}
                                    startIcon={<ArrowBackIcon />}
                                    sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                                >
                                    {t('CandidatePortal.back')}
                                </Button>
                                {!isDone && (
                                    <Button
                                        variant="contained"
                                        onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
                                        disabled={primaryDisabled}
                                    >
                                        {activeStep === steps.length - 2 ? t('CandidatePortal.finish') : (isWelcome ? t('CandidatePortal.welcomeStart') : t('CandidatePortal.next'))}
                                    </Button>
                                )}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

const PortalSpinner = () => (
    <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
        </Box>
    </Container>
);

const AssessmentFlowLoader = ({ assignmentId, onBack }: { assignmentId: string, onBack: () => void }) => {
    const myAssessment = useGetMyAssessmentQuery(assignmentId);

    if (myAssessment.isLoading) return <PortalSpinner />;

    const assignment = myAssessment.data?.assignment;
    const stages: AssessmentStageVM[] = myAssessment.data?.stages ?? [];

    if (!assignment || stages.length === 0) {
        return <LegacyFlow />;
    }

    return (
        <AssessmentFlow
            assignment={assignment}
            stages={stages}
            refetch={myAssessment.refetch}
            onBack={onBack}
        />
    );
};

export const Component = () => {
    const myAssessments = useGetMyAssessmentsQuery();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (myAssessments.isLoading) return <PortalSpinner />;

    const assignments: AssessmentSummaryVM[] = myAssessments.data?.assignments ?? [];

    if (selectedId) {
        return (
            <AssessmentFlowLoader
                assignmentId={selectedId}
                onBack={() => {
                    setSelectedId(null);
                    myAssessments.refetch();
                }}
            />
        );
    }

    if (assignments.length === 0) {
        return <LegacyFlow />;
    }

    return <AssessmentList assignments={assignments} onSelect={setSelectedId} />;
};

Component.displayName = 'CandidatePortal';
