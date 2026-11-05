import type { ChangeEvent } from 'react';
import { lazy, useCallback } from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import CVFiles from './CVFiles';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, IconButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { RouterLink } from 'src/components/router-link';

const AccountGeneralSettings = lazy(() => import('./GeneralSettings'));
const AccountExperiencesSettings = lazy(() => import('./ExperiencesSettings'));
const AccountEducationSettings = lazy(() => import('./EducationSettings'));
const AccountCertificateSettings = lazy(() => import('./CertificateSettings'));
const AccountLanguageSettings = lazy(() => import('./LangugageSettings'));
const AccountSkillSettings = lazy(() => import('./SkillSettings'));

export const Component = () => {
  const { t } = useTranslation();
  const tabs = [
    { label: t('General'), value: 'general' },
    { label: t('CV Files'), value: 'cv' },
    { label: t('Experiences'), value: 'experiences' },
    { label: t('Education'), value: 'education' },
    { label: t('certificates'), value: 'certificates' },
    { label: t('languages'), value: 'languages' },
    // { label: t('skills'), value: 'skills' },
  ];


  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') ?? 'general';

  usePageView();

  const goBackJobId = searchParams.get('goBackJobId');

  const handleTabsChange = useCallback(
    (event: ChangeEvent<any>, value: string): void => {
      setSearchParams((prev) => {
        prev.set('tab', value);
        return prev;
      });
      scrollToElementById('account-' + value?.toString())
    },
    [setSearchParams]
  );

  function scrollToElementById(elementId: any) {
    const element = document.getElementById(elementId);
    if (element) {
      const topPos = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: topPos - 74,
        behavior: 'smooth'  // This ensures the scrolling is smooth
      });
    }
  }

  return (
    <>
      <Seo title="Dashboard: Account" />
      <div className='flex gap-8 pr-[55px] pb-10'>
        <div className='w-1/5 h-full sticky top-20 pt-2'>
          <Tabs
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="primary"
            value={currentTab}
            variant="scrollable"
            orientation='vertical'
            sx={{
              // position: 'sticky',
              // top: 80,
              background: 'white',
              "& .Mui-selected": { color: "#E31E24!important", },
              "& .MuiTabs-indicator": { backgroundColor: "#E31E24" },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                sx={{
                  marginLeft: '0 !important',
                  paddingLeft: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '8px',
                  justifyContent: 'flex-start',
                  flexDirection: 'row',
                  fontSize: '16px',
                  '> svg': {
                    marginBottom: '0 !important',
                  },
                  textAlign: "start"
                }}
              />
            ))}
          </Tabs>
        </div>
        <div className='w-4/5 flex flex-col gap-4'>
          {!!goBackJobId && (
            <Alert
              severity="info"
              className="!bg-slate-200"
              icon={false}
            >
              <div className="flex items-center gap-x-2">
                <IconButton
                  LinkComponent={RouterLink}
                  href={`/apply/${goBackJobId}`}
                >
                  <ArrowBack />
                </IconButton>
                <Typography>{t('Go back job application')}</Typography>
              </div>
            </Alert>
          )}

          <AccountGeneralSettings />
          <CVFiles />
          <AccountExperiencesSettings />
          <AccountEducationSettings />
          <AccountCertificateSettings />
          <AccountLanguageSettings />
          {/* <AccountSkillSettings /> */}

        </div>
      </div>

      {/* <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Typography variant="h4">{t('Account')}</Typography>
            {!!goBackJobId && (
              <Alert
                severity="info"
                className="!bg-slate-200"
                icon={false}
              >
                <div className="flex items-center gap-x-2">
                  <IconButton
                    LinkComponent={RouterLink}
                    href={`/apply/${goBackJobId}`}
                  >
                    <ArrowBack />
                  </IconButton>
                  <Typography>{t('Go back job application')}</Typography>
                </div>
              </Alert>
            )}
            <div>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                allowScrollButtonsMobile
                textColor="primary"
                value={currentTab}
                variant="scrollable"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                  />
                ))}
              </Tabs>
              <Divider />
            </div>
          </Stack>
          <Suspense>
            {currentTab === 'general' && <AccountGeneralSettings />}
            {currentTab === 'cv' && <CVFiles />}
            {currentTab === 'experiences' && <AccountExperiencesSettings />}
            {currentTab === 'education' && <AccountEducationSettings />}
            {currentTab === 'certificates' && <AccountCertificateSettings />}
            {currentTab === 'languages' && <AccountLanguageSettings />}
            {currentTab === 'skills' && <AccountSkillSettings />}
          </Suspense>
        </Container>
      </Box> */}
    </>
  );
};

Component.displayName = 'AccountSettings';

/*
            {currentTab === 'notifications' && <AccountNotificationsSettings />}
  {currentTab === 'security' && (
              <AccountSecuritySettings
                loginEvents={[
                  {
                    id: '1bd6d44321cb78fd915462fa',
                    createdAt: subDays(subHours(subMinutes(now, 5), 7), 1).getTime(),
                    ip: '95.130.17.84',
                    type: 'Credential login',
                    userAgent: 'Chrome, Mac OS 10.15.7',
                  },
                  {
                    id: 'bde169c2fe9adea5d4598ea9',
                    createdAt: subDays(subHours(subMinutes(now, 25), 9), 1).getTime(),
                    ip: '95.130.17.84',
                    type: 'Credential login',
                    userAgent: 'Chrome, Mac OS 10.15.7',
                  },
                ]}
              />
            )}
*/
