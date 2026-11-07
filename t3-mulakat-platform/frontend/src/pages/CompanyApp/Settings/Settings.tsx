import { Box, Drawer, IconButton, Tab, Tabs } from '@mui/material';
import { Cancel01Icon, Configuration01Icon, DashboardSquare03Icon, DocumentValidationIcon, FireIcon, Layout3ColumnIcon, Mail02Icon, MailBlock02Icon, UserGroupIcon, UserMultiple02Icon } from 'hugeicons-react';
import { Fragment, Suspense, lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
const SETTINGS_TABS = [
  { label: 'Company Settings', value: 'general', icon: Configuration01Icon, disabled: true },
  // { label: 'Plan & Billing', value: 'plan', icon: Payment },
  { label: 'Team Members', value: 'team-members', icon: UserMultiple02Icon, disabled: true },
  { label: 'Recruitment Stages', value: 'recruitment-stages', icon: Layout3ColumnIcon, disabled: true },
  { label: "Email Templates", value: "email-templates", icon: Mail02Icon, disabled: true },
  { label: "Disqualify Templates", value: "disqualify-email-templates", icon: MailBlock02Icon, disabled: true },
  { label: 'Evaluation Templates', value: 'evaluation-templates', icon: DashboardSquare03Icon, disabled: true },
  { label: "Onboarding", value: "onboarding", icon: UserGroupIcon, disabled: true },
  { label: "Quotas", value: "quotas", icon: FireIcon, disabled: true },
  { label: "interview", value: "interview", icon: QuestionAnswerIcon },
  { label: "Quiz", value: "quiz", icon: DocumentValidationIcon, disabled: true },
  { label: "Değerlendirme Süreci", value: "assessment-process", icon: AccountTreeIcon },
];

const SettingsTabMapper = {
  'general': lazy(() => import('./CompanySettings')),
  'team-members': lazy(() => import('./TeamMembersSettings')),
  'recruitment-stages': lazy(() => import('./RecruitmentStages')),
  'email-templates': lazy(() => import('./EmailTemplates')),
  'disqualify-email-templates': lazy(() => import('./DisqualifyMailSettings')),
  'evaluation-templates': lazy(() => import('./EvaluationTemplates')),
  'onboarding': lazy(() => import('./OnboardingWorkflows')),
  'quotas': lazy(() => import('./Quotas')),
  'interview': lazy(() => import('./Interview')),
  'assessment-process': lazy(() => import('./AssessmentProcess')),
  'quiz': lazy(() => import('./Quiz')),
  "quizQuestions": lazy(() => import('./QuizQuestions')),
  "quizList": lazy(() => import('./QuizQuestionList'))

};

export default function SettingsDrawer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const settings = useMemo(() => searchParams.get('settings'), [searchParams]);
  const activeTab = useMemo(() => searchParams.get('activeTab') || 'interview', [searchParams]);

  const onClose = () => {
    setSearchParams((prev) => {
      prev.delete('settings');
      prev.delete('activeTab');
      return prev;
    });
  };

  const open = settings === 'open';

  const ActiveComponent =
    SettingsTabMapper[activeTab as keyof typeof SettingsTabMapper] ?? Fragment;

  return (
    <Drawer
      anchor={'bottom'}
      open={open}
      onClose={onClose}
    >
      <Box
        sx={{
          flexGrow: 1,
          alignItems: 'flex-start',
          display: 'flex',
          height: '90vh',
          columnGap: '50px',
          position: 'relative',
        }}
      >
        <div className="absolute right-6 top-6">
          <IconButton onClick={onClose}>
            <Cancel01Icon />
          </IconButton>
        </div>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={activeTab}
          onChange={(e: any, value: any) =>
            setSearchParams((prev) => {
              prev.set('activeTab', value);
              prev.delete('page')
              prev.delete('limit')
              return prev;
            })
          }
          sx={{
            height: '100%',
            width: 275,
            background: 'white',
            pt: 2,
            borderRight: "1px solid #EEEEEE",
            "& .Mui-selected": { color: "#E31E24!important", },
            "& .MuiTabs-indicator": { backgroundColor: "#E31E24" },
          }}
          TabIndicatorProps={{ sx: { display: 'none' } }}
        >
          {SETTINGS_TABS.map((setting, index) => {
            const Icon = setting.icon;
            return (
              <Tab
                tabIndex={index}
                icon={<Icon />}
                disabled={setting.disabled}
                sx={{
                  marginLeft: '0 !important',
                  paddingLeft: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '8px',
                  justifyContent: 'flex-start',
                  flexDirection: 'row',
                  '> svg': {
                    marginBottom: '0 !important',
                  },
                  textAlign: "start",
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }
                }}
                label={t(setting.label)}
                key={setting.value}
                value={setting.value}
              />
            );
          })}
        </Tabs>
        <Suspense>
          <ActiveComponent />
        </Suspense>
      </Box>
    </Drawer>
  );
}
