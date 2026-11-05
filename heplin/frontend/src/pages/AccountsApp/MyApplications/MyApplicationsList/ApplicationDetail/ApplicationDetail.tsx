import { Close, MoreVert } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom'; import {
  useDeleteCandidateDrawJobApplicationMutation,
  useGetCandidateJobApplicationDetailQuery,
} from 'src/hooks/useServices';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ChangeEvent, useCallback, useState } from 'react';
import CvViewerTab from './Tabs/CvViewerTab';
import OverviewTab from './Tabs';
import ApplicationFormTab from './Tabs/ApplicationFormTab';
import CoverLetterTab from './Tabs/CoverLetterTab';
import { useTranslation } from 'react-i18next';
import { convertPublicFileURL } from 'src/utils';

const tabs = [
  { label: 'overview', value: 'overview' },
  { label: 'applicationForm', value: 'applicationForm' },
  { label: 'cv', value: 'cv' },
  { label: 'coverLetter', value: 'coverLetter' },
];

type TabValue = 'overview' | 'cv' | 'coverLetter' | 'applicationForm';

type ApplicationDetailProps = {
  refetchApplications: () => void;
};

export default function ApplicationDetail({ refetchApplications }: ApplicationDetailProps) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState<TabValue>('overview');
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const activeApplicationId = searchParams.get('applicationId');
  const applicationQuery: any = useGetCandidateJobApplicationDetailQuery({
    id: activeApplicationId ?? '',
  });
  const application = applicationQuery?.data?.application;
  const applicationWithDrawMutation = useDeleteCandidateDrawJobApplicationMutation();
  const dynamicLanguage = i18n.language;

  const handleApplicationWithdraw = async (id: string) => {
    try {
      await applicationWithDrawMutation.mutateAsync({ id });
      refetchApplications();
      onClose();
    } catch (error) {
      console.error('Başvuruyu geri çekerken hata oluştu:', error);
    }
  };

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: TabValue): void => {
    setCurrentTab(value);
  }, []);

  const onClose = () =>
    setSearchParams((prev) => {
      prev.delete('applicationId');
      return prev;
    });

  const isOpen = !!activeApplicationId && !!applicationQuery;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      anchor="right"
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: '60vw',
          '@media (max-width:1024px)': {
            width: '100%',
          },
        },
      }}
      sx={{ flexShrink: 0 }}
    >
      <Stack
        px={3}
        py={4}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >

            {!isMobile ?
              <Avatar
                src={convertPublicFileURL(application?.tenantId?.logo ?? "")}
                sx={{ width: 60, height: 60, fontSize: 28, fontWeight: 400 }}
              >
                {application?.tenantId?.logo
                  ? ''
                  : application?.tenantId?.name?.slice(0, 2).toUpperCase()}
              </Avatar> : null}
            <Stack spacing={1}>
              <Typography variant={isMobile ? "h6" : "h5"}>{application?.jobId?.title}</Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={400}
                  fontSize={isMobile ? 14 : 18}
                >
                  {application?.tenantId?.name}
                </Typography>
                <Chip
                  variant="outlined"
                  size="small"
                  label={t(application?.jobId?.jobType)}
                />
                <Chip
                  variant="outlined"
                  size="small"
                  label={t(application?.jobId?.locationType)}
                />
              </Stack>
              <Typography variant="body2">
                {
                  [application?.jobId?.country?.names?.[dynamicLanguage], application?.jobId?.city, application?.jobId?.district].filter(Boolean).join(' · ')
                }
              </Typography>
            </Stack>
          </Stack>

          <Stack>
            <Box>
              {!isMobile ?
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleApplicationWithdraw(application?._id)}
                >
                  {t('withdrawApplication')}
                </Button> : null}
              {/* <IconButton>
                <MoreVert />
              </IconButton> */}
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Box>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Stack direction="row">
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              value={currentTab}
              scrollButtons="auto"
              textColor="primary"
              variant="scrollable"
            // onChange={}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={t(tab.label)}
                  value={tab.value}
                />
              ))}
            </Tabs>
          </Stack>
          <Divider />
          <Stack>
            {currentTab == 'overview' && <OverviewTab application={application} />}
            {currentTab == 'applicationForm' && (
              <ApplicationFormTab
                answers={application?.applicantAnswers}
                questions={application?.jobId?.applicantForm}
              />
            )}
            {currentTab == 'cv' && <CvViewerTab fileId={application?.cv} />}
            {currentTab == 'coverLetter' && <CoverLetterTab application={application} />}
          </Stack>
          <Divider />
        </Stack>
      </Stack>
    </Drawer>
  );
}
