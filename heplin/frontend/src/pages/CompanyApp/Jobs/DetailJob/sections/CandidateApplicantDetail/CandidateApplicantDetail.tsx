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
import { Alert, IconButton, Tab, Tabs, Tooltip, Box, Card, useTheme } from '@mui/material';
import { ActivityTab, CommentsTab, FilesTab, OverviewTab, MailTab, HeplinAiTab } from './sections';
import { useApplicantQuery, useGetCandidateDetailQuery, useGetMyEmployeeDataQuery, useUpdateApplicantReview } from 'src/hooks/useServices';
import Header from './sections/Header';
import { FormType } from 'src/types/jobPost';
import { useTranslation } from 'react-i18next';
import { ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useDetailJob } from '../../DetailJobProvider';
import InterviewTab from './sections/InterviewTab';
import PersonalTestTab from './sections/PersonalTestTab';
import VideoInterviewTab from './sections/VideoInterview/VideoInterviewTab';
import CvDetailDrawer from './components/CvDetailDrawer';
import DescriptionIcon from '@mui/icons-material/Description';
import { Stack } from '@mui/system';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CandidateApplicantDetailDrawerProps { }

type TabValue = 'overview' | 'files' | 'comments' | 'activity' | 'mail' | 'heplinAi' | 'interview' | 'personalTest' | 'videoInterview';

type Skill = {
  _id: string;
  name: string;
  slug: string;
  skills: { name: string, _id: string };
};

type LanguageSkill = {
  _id: string;
  level: string;
  langCode: string;
};

type RecruitmentStep = {
  _id: string;
  title: string;
  color: string;
  description?: string;
  recruitmentStageId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApplicantForm = {
  _id: string;
  type: FormType;
  options: any;
  title: string;
};

export type ApplicantAnswer = {
  _id: string;
  questionId: string;
  answer: any;
  isMatching?: boolean
};

type JobApplicationStatus =
  "applied" |
  "onBoarding" |
  "hired" |
  "cancelledByCandidate" |
  "disqualified"

type AppliedJob = {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    applicantForm: ApplicantForm[];
  };
  cv: any;
  status: JobApplicationStatus;
  applicantAnswers: ApplicantAnswer[];
  coverLetter: string | null;
  currentRecruitmentStepId: RecruitmentStep;
  name: string;
  surname: string
};

type Candidate = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    surname: string;
    avatar?: string;
    email: string;
    phone?: string;
    preferredLanguage: string;
    createdAt: Date;
    updatedAt: Date;
  };
  skills: any[];
  languageSkills: LanguageSkill[];
  appliedJobs: AppliedJob[];
  experiences: any[];
  educations: any[];
  languages: any[];
  certificates: any[];
  createdAt: Date;
  updatedAt: Date;
};

type CandidateContext = {
  currentTab: TabValue;
  applicantState: {
    isLoading: boolean;
    data: any
    error: any
  }
  candidateState: {
    isLoading: boolean;
    data: null | Candidate;
    error: null | string;
  };
  isOpen: boolean;
  onClose: () => void;
  handleSwitchChange: () => void;
  isSeen: null | boolean
};

const Context = createContext<CandidateContext>({
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
  handleSwitchChange: () => { },
  isSeen: null,
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
  overview: OverviewTab,
  files: FilesTab,
  comments: CommentsTab,
  activity: ActivityTab,
  mail: MailTab,
  heplinAi: HeplinAiTab,
  interview: InterviewTab,
  personalTest: PersonalTestTab,
  videoInterview: VideoInterviewTab
};

const CandidateApplicantDetailDrawer: FC<CandidateApplicantDetailDrawerProps & { fromCandidatesList?: boolean }> = ({ fromCandidatesList }) => {
  const theme = useTheme();

  const tabs: { value: TabValue; label: string; disabled?: boolean }[] = [
    {
      value: 'overview',
      label: 'overview',
      disabled: true,
    },
    {
      value: 'files',
      label: 'files',
      disabled: true,
    },
    {
      value: 'comments',
      label: 'comments',
      disabled: true,
    },
    {
      value: 'mail',
      label: 'mail',
      disabled: true,
    },

    {
      value: 'personalTest',
      label: 'personalTest',
      disabled: true,
    },
    ...(fromCandidatesList ? [] : [{ value: 'heplinAi' as TabValue, label: 'Heplin Ai', disabled: true }]),
    {
      value: 'interview',
      label: 'Interview',
      disabled: true,
    },
    {
      value: 'videoInterview',
      label: 'VideoInterviewTab'
    },
  ];


  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams(); const [currentTab, setCurrentTab] = useState<TabValue>('videoInterview');
  const candidateId = useMemo(() => searchParams.get('candidateId'), [searchParams]);
  const nextcandidate = useMemo(() => searchParams.get('nextcandidate'), [searchParams]);
  const employeeDataQuery = useGetMyEmployeeDataQuery();
  const queryClient = useQueryClient();
  const { hiringTeamsState, boardRoam, jobState } = useDetailJob();


  const [cvDrawerOpen, setCvDrawerOpen] = useState(false);

  const candidateQuery = useGetCandidateDetailQuery({ id: candidateId ?? '' });


  const updateApplicantMutation = useUpdateApplicantReview()
  const params = useParams();
  const jobId = params?.id;

  const candidate = candidateQuery?.data?.candidate;
  const applicationId = candidate?.appliedJobs?.find((item: any) => item?.jobId?._id === jobId)

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
  const isSeen = applicationId?.viewedBy?.some((v: any) => v.employeeId === employeeDataQuery?.data?.employee?._id && v.isSeen);

  const handleSwitchChange = () => {
    const employeeId = employeeDataQuery?.data?.employee?._id;
    const currentViewedBy = applicationId?.viewedBy?.find((v: any) => v.employeeId === employeeId);

    const payload = {
      viewedBy: {
        employeeId: employeeId,
        isSeen: !currentViewedBy?.isSeen,
      },
      operation: currentViewedBy ? 'update' : 'add',
    };

    updateApplicantMutation.mutateAsync(
      {
        jobId: jobId ?? '',
        id: applicationId?._id,
        payload,
      },
      {
        onSuccess(data, variables, context) {
          hiringTeamsState.refetch()
          candidateQuery.refetch()
          queryClient.refetchQueries(['jobs', 'applications', 'company-application']) // all Applicant is Seen stuation

        },
      }
    );
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
          handleSwitchChange,
          isSeen: isSeen,
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
                      disabled={tab.disabled}
                    />
                  ))}
                </Tabs>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* <Tooltip title={t('viewCV')}>
                    <IconButton
                      onClick={() => setCvDrawerOpen(true)}
                      sx={{
                        backgroundColor: theme.palette.primary.lightest,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.light,
                          transform: 'translateY(-1px)',
                          boxShadow: `0 2px 4px ${theme.palette.primary.alpha12}`,
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      <DescriptionIcon />
                    </IconButton>
                  </Tooltip> */}
                  {
                    isBoardUrl &&
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={t('back')}>
                        <IconButton
                          disabled={boardRoam.currentIndex <= 0}
                          onClick={() => boardRoam.handlePrevious()}
                          sx={{
                            backgroundColor: theme.palette.primary.lightest,
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.light,
                              transform: 'translateY(-1px)',
                              boxShadow: `0 2px 4px ${theme.palette.primary.alpha12}`,
                            },
                            '&:disabled': {
                              backgroundColor: theme.palette.neutral[100],
                              color: theme.palette.neutral[400],
                            },
                            transition: 'all 0.2s',
                          }}
                        >
                          <ArrowLeft01Icon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('next')}>
                        <IconButton
                          disabled={boardRoam.currentIndex >= boardRoam.drawercandidateList.length - 1}
                          onClick={() => boardRoam.handleNext()}
                          sx={{
                            backgroundColor: theme.palette.primary.lightest,
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.light,
                              transform: 'translateY(-1px)',
                              boxShadow: `0 2px 4px ${theme.palette.primary.alpha12}`,
                            },
                            '&:disabled': {
                              backgroundColor: theme.palette.neutral[100],
                              color: theme.palette.neutral[400],
                            },
                            transition: 'all 0.2s',
                          }}
                        >
                          <ArrowRight01Icon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                </Box>
              </Box>
              <Box sx={{ p: 2, backgroundColor: 'transparent' }}>
                <Card sx={{
                  boxShadow: theme.shadows[2],
                  borderRadius: '12px',
                  backgroundColor: theme.palette.background.paper,
                  overflow: 'hidden',
                  minHeight: 'calc(100vh - 200px)',
                }}>
                  <ActiveTabComponent />
                </Card>
              </Box>
            </>)}
          <CvDetailDrawer
            open={cvDrawerOpen}
            onClose={() => setCvDrawerOpen(false)}
            cvData={{
              jobId: jobId || '',
              fileId: applicationId?.cv?._id || '',
              userInfo: `${candidate?.userId?.name || ''} ${candidate?.userId?.surname || ''}`
            }}
          />
        </div>
      </Context.Provider>
    </Drawer>
  );
};

export default CandidateApplicantDetailDrawer;
