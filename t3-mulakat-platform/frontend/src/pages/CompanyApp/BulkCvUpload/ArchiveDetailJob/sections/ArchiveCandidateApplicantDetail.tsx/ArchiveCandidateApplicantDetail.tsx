import {
    useMemo,
    type FC,
    useCallback,
    useState,
    ChangeEvent,
    createContext,
    useContext,
} from 'react';
import { backdropClasses } from '@mui/material/Backdrop';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Alert, IconButton, Tab, Tabs, Tooltip, useTheme, Box } from '@mui/material';
import { useApplicantQuery, useGetArchiveCandidateDetailQuery, useGetMyEmployeeDataQuery, useUpdateApplicantReview } from 'src/hooks/useServices';

import { FormType } from 'src/types/jobPost';
import { useTranslation } from 'react-i18next';
import { ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';
import { useQueryClient } from '@tanstack/react-query';
import Header from './sections/Header';
import ArchiveHeplinAiTab from './sections/ArchiveHeplinAi/ArchiveHeplinAi';
import ArchiveOverviewTab from './sections/OverviewTab';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CandidateApplicantDetailDrawerProps { }

type TabValue = 'overview' | 'heplinAi';



type LanguageSkill = {
    _id: string;
    level: string;
    langCode: string;
};



export type ApplicantForm = {
    _id: string;
    type: FormType;
    options: any;
    title: string;
};



type AppliedJob = {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        applicantForm: ApplicantForm[];
    };
    cv: any;
    coverLetter: string | null;
    name: string;
    surname: string
};


type AechiveCandidate = {
    _id: string;
    name: string;
    surname: string;
    skills: any[];
    languageSkills: LanguageSkill[];
    appliedJobs: AppliedJob[];
    experience: any[];
    education: any[];
    languages: any[];
    certificates: any[];
    createdAt: Date;
    updatedAt: Date;
    email: string;
    phone: string;
};


type ArchiveCandidateContext = {
    currentTab: TabValue;
    applicantState: {
        isLoading: boolean;
        data: any
        error: any
    }
    candidateState: {
        isLoading: boolean;
        data: null | AechiveCandidate;
        error: null | string;
    };
    isOpen: boolean;
    onClose: () => void;
    // handleSwitchChange: () => void;
    // isSe
    // en: null | boolean
};


const Context = createContext<ArchiveCandidateContext>({
    currentTab: 'overview',
    applicantState: {
        isLoading: false,
        data: null,
        error: null
    },
    candidateState: {
        isLoading: false,
        data: null,
        error: null,
    },
    isOpen: false,
    onClose: () => { },
    // handleSwitchChange: () => { },
    // isSeen: null,
});

export const useCandidateDetail = () => {
    const context = useContext(Context);

    if (!context)
        throw new Error(
            'useCandidateDetail hook must be used inside of CandidateApplicantDetailDrawer component!'
        );

    return context;
};

const TabsComponentMapper = {
    overview: ArchiveOverviewTab,
    heplinAi: ArchiveHeplinAiTab,

};

const ArchiveCandidateApplicantDetailDrawer: FC<CandidateApplicantDetailDrawerProps & { fromCandidatesList?: boolean }> = ({ fromCandidatesList }) => {
    const theme = useTheme();

    const tabs: { value: TabValue; label: string }[] = [
        {
            value: 'overview',
            label: 'overview',
        },
        ...(fromCandidatesList ? [] : [{ value: 'heplinAi' as TabValue, label: 'T3 AI' }]),
    ];


    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentTab, setCurrentTab] = useState<TabValue>('overview');
    const candidateId = useMemo(() => searchParams.get('candidateId'), [searchParams]);


    const candidateQuery = useGetArchiveCandidateDetailQuery({ id: candidateId ?? '' });




    const params = useParams();
    const jobId = params?.id;

    const candidate = candidateQuery?.data?.candidate;



    const applicantDetailQuery = useApplicantQuery(jobId ?? '', candidateId ?? '');



    const onClose = () => {
        setSearchParams((prev) => {
            prev.delete('candidateId');
            return prev;
        });
        setSearchParams(prev => {
            prev.delete('comment')
            return prev
        })
        setSearchParams(prev => {
            prev.delete('nextcandidate')
            return prev
        })
        setSearchParams(prev => {
            prev.delete('previouscandidate')
            return prev
        })
    };



    const open = !!candidateId;

    const handleTabsChange = useCallback((event: ChangeEvent<any>, value: TabValue): void => {
        setCurrentTab(value);
    }, []);

    const ActiveTabComponent = TabsComponentMapper?.[currentTab as keyof typeof TabsComponentMapper];

    const location = useLocation();

    const isBoardUrl = /\/board(\/|$)/.test(location.pathname);

    return (
        <Drawer
            variant="persistent"
            anchor="right"
            ModalProps={{
                sx: {
                    [`& .${backdropClasses.root}`]: {
                        background: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            }}
            onClose={onClose}
            open={open}
            PaperProps={{
                sx: {
                    maxWidth: '100%',
                    width: { xs: '100vw', sm: '80vw', md: '65vw' },
                    background: theme.palette.neutral[50],
                    boxShadow: theme.shadows[8],
                    overflowY: 'auto',
                },
            }}
            sx={{ flexShrink: 0 }}
        >
            <Context.Provider
                value={{
                    currentTab,
                    applicantState: {
                        isLoading: applicantDetailQuery?.isLoading,
                        data: applicantDetailQuery?.data,
                        error: applicantDetailQuery?.isError
                    },
                    candidateState: {
                        isLoading: candidateQuery.isLoading,
                        data: candidate,
                        error: candidateQuery.isError
                            ? (candidateQuery.error as any)?.message?.toString()
                            : null,

                    },
                    isOpen: open,
                    onClose,
                    // handleSwitchChange,
                    // isSeen: isSeen,
                }}
            >
                <div>
                    <Header />

                    {!!candidateQuery.isError && !candidate ? (
                        <Alert severity="error">{(candidateQuery?.error as any)?.message}</Alert>
                    ) : (
                        <>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: theme.palette.background.paper,
                                mx: 2,
                                mt: 2,
                                borderRadius: 2,
                                boxShadow: theme.shadows[1],
                                p: 1
                            }}>
                                <Tabs
                                    indicatorColor="primary"
                                    onChange={handleTabsChange}
                                    scrollButtons="auto"
                                    textColor="primary"
                                    value={currentTab}
                                    variant="scrollable"
                                    sx={{
                                        '& .MuiTab-root': {
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            fontSize: '0.875rem',
                                            minHeight: '42px',
                                            px: 2.5,
                                            py: 1.5,
                                            mx: 0.5,
                                            borderRadius: '8px',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.alpha4,
                                                color: theme.palette.primary.main,
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: theme.palette.primary.main,
                                                color: theme.palette.primary.contrastText,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.primary.darkest,
                                                },
                                            },
                                        },
                                        '& .MuiTabs-indicator': {
                                            display: 'none',
                                        },
                                    }}
                                >
                                    {tabs.map((tab) => (
                                        <Tab
                                            key={tab.value}
                                            label={t(tab.label)}
                                            value={tab.value}
                                        />
                                    ))}
                                </Tabs>
                                {
                                    isBoardUrl &&
                                    <div className='mr-4'>
                                        <Tooltip title={t('back')}>
                                            <IconButton color="primary"  >
                                                <ArrowLeft01Icon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('next')}>
                                            <IconButton color="primary" >
                                                <ArrowRight01Icon />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                }
                            </Box>

                            <Divider />
                            <ActiveTabComponent />
                        </>
                    )}

                </div>
            </Context.Provider>
        </Drawer>
    );
};

export default ArchiveCandidateApplicantDetailDrawer;
