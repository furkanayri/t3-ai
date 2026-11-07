import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  TableCell,
  TableRow,
  TableBody,
  Table,
  TableHead,
} from '@mui/material';
import { SeverityPillColor } from 'src/components/severity-pill';
import { AppliedStatus } from './type';
import { ArrowForward, MoreVertOutlined } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import ApplicationDetail from './ApplicationDetail';
import { useGetAllCandidateJobApplicationsQuery } from 'src/hooks/useServices';
import { useTranslation } from 'react-i18next';
import { array, convertPublicFileURL } from 'src/utils';
import { useMemo } from 'react';
import { RouterLink } from 'src/components/router-link';
import { useRouter } from 'src/hooks/use-router';
import store from 'store';

type AppliedStatusMapperType = { [key in AppliedStatus]: SeverityPillColor };

export function Component() {
  const { t, i18n } = useTranslation();
  const jobApplicationsQuery = useGetAllCandidateJobApplicationsQuery();
  const jobApplicationsData = array<any>(jobApplicationsQuery?.data?.results);
  const router = useRouter();
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const dynamicLanguage = i18n.language
  const onboardingApplications = useMemo(
    () => jobApplicationsData.filter((application) => application.status === 'onBoarding'),
    [jobApplicationsData]
  );
  const processingApplications = useMemo(
    () => jobApplicationsData.filter((application) => application.status === 'applied'),
    [jobApplicationsData]
  );
  const hiredApplications = useMemo(
    () => jobApplicationsData.filter((application) => application.status === 'hired'),
    [jobApplicationsData]
  );
  const latestApply = store.get('latestApplyJob');

  const handleLatestJobApply = () => {
    router.push(`/apply/${latestApply.jobId}`);
  };


  return (
    <>
      <ApplicationDetail refetchApplications={jobApplicationsQuery.refetch} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack sx={{ mb: 3 }}>
            <div className="flex items-center justify-between">
              <Typography variant={isMobile ? 'h6' : 'h4'}>{t('My Applications')}</Typography>
              {latestApply?.jobId ? (
                <div>
                  <Button
                    sx={{
                      fontSize: '15px',
                      padding: '6px 12px',
                      '@media (max-width:1024px)': {
                        fontSize: '12px',
                        padding: '4px 10px',
                      },
                    }}
                    variant="outlined"
                    onClick={handleLatestJobApply}
                  >
                    {t('continueJobPost')}
                  </Button>
                </div>
              ) : null}
            </div>
          </Stack>

          {jobApplicationsQuery.isLoading ? (
            <CircularProgress sx={{ m: 4 }} />
          ) : jobApplicationsQuery.isError ? (
            <Alert severity="error">{(jobApplicationsQuery?.error as any)?.message}</Alert>
          ) : jobApplicationsData.length === 0 ? (
            <>
              <Alert
                sx={{ borderRadius: 0 }}
                icon={false}
              >
                {t('Finding new jobs feature is under development.')}{' '}
                <RouterLink
                  target="_blank"
                  href="https://www.hitatek.com/tr"
                >
                  <span>{t('Learn more')}</span>
                </RouterLink>
              </Alert>
              <Alert
                severity="warning"
                sx={{ m: 4 }}
              >
                {t('There are no applications')}
              </Alert>
            </>

          ) : !isMobile ? (
            <Card>
              <Divider />
              <CardContent sx={{ p: 0, paddingBottom: '0px !important' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('jobApplication')}</TableCell>
                      <TableCell>{t('Location Type')}</TableCell>
                      <TableCell>{t('recruitmentStepsCount')}</TableCell>
                      <TableCell>{t('jobType')}</TableCell>
                      <TableCell>{t('appliedDate')}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {onboardingApplications?.length > 0 && (
                      <>
                        <ApplicationTableTitle
                          title={t('InOnboardingProcess')}
                          colSpan={6}
                        />
                        {onboardingApplications?.map((application: any) => (
                          <ApplicationTableItem
                            key={application?._id}
                            application={application}
                          />
                        ))}
                      </>
                    )}
                    {processingApplications?.length > 0 && (
                      <>
                        <ApplicationTableTitle
                          title={t('ApplicationInProgress')}
                          colSpan={6}
                        />
                        {processingApplications?.map((application: any) => (
                          <ApplicationTableItem
                            key={application?._id}
                            application={application}
                          />
                        ))}
                      </>
                    )}
                  </TableBody>
                  <TableBody>
                    {hiredApplications?.length > 0 && (
                      <>
                        <ApplicationTableTitle
                          title={t('Hired')}
                          colSpan={6}
                        />
                        {hiredApplications?.map((application: any) => (
                          <ApplicationTableItem
                            key={application?._id}
                            application={application}
                          />
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <List>
              {onboardingApplications?.length > 0 && (
                <>
                  <Typography
                    variant="h6"
                    sx={{ backgroundColor: '#f2f2f2', padding: '8px 16px' }}
                  >
                    {t('InOnboardingProcess')}
                  </Typography>
                  {onboardingApplications?.map((application: any) => (
                    <>
                      <ApplicationListItem
                        key={application?._id}
                        application={application}
                      />
                      <Button
                        onClick={(e) => e.stopPropagation()}
                        startIcon={<ArrowForward />}
                        LinkComponent={RouterLink}
                        href={`/onboard/${application?.onboardingId?._id}`}
                      >
                        {application?.onboardingId?.status === 'completed'
                          ? 'View Onboarding Form'
                          : 'Start Onboarding'}
                      </Button>
                    </>
                  ))}
                </>
              )}
              {processingApplications?.length > 0 && (
                <>
                  <Typography
                    variant="h6"
                    sx={{ backgroundColor: '#f2f2f2', padding: '8px 16px' }}
                  >
                    {t('ApplicationInProgress')}
                  </Typography>
                  {processingApplications?.map((application: any) => (
                    <ApplicationListItem
                      key={application?._id}
                      application={application}
                    />
                  ))}
                </>
              )}
            </List>
          )}
        </Container>
      </Box>
    </>
  );
}

Component.displayName = 'MyApplicationsList';

function ApplicationTableTitle({ title, colSpan }: { title: string; colSpan: number }) {
  return (
    <TableRow sx={{ backgroundColor: '#f2f2f2' }}>
      <TableCell colSpan={colSpan}>
        <Typography variant="h6">{title}</Typography>
      </TableCell>
    </TableRow>
  );
}

function ApplicationTableItem({ application }: { application: any }) {
  const [_searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const dynamicLanguage = i18n.language
  const openApplicationDetail = (applicationId: string) => {
    setSearchParams((prev) => {
      prev.set('applicationId', applicationId);
      return prev;
    });
  };
  return (
    <TableRow
      key={application?._id}
      onClick={(e) => openApplicationDetail(application?._id)}
    >
      <TableCell>
        {application?.status === 'onBoarding' && application?.onboardingId && (
          <div className="">
            {application?.onboardingId?.status === 'pending' && (
              <Typography variant="subtitle1">
                {application?.tenantId?.name} requested an onboarding form to hire you!
              </Typography>
            )}
            <div>
              <div className="flex gap-2 items-center">
                <Typography variant="subtitle2"> {t('Status')}: </Typography>
                <Chip
                  variant="outlined"
                  label={t(application?.onboardingId?.status)}
                  color={application?.onboardingId?.status === 'completed'
                    ? 'success'
                    : application?.onboardingId?.status === 'documentsMissing'
                      ? 'error'
                      : 'default'}
                  size="small"
                />
                <Button
                  onClick={(e) => e.stopPropagation()}
                  startIcon={<ArrowForward />}
                  LinkComponent={RouterLink}
                  href={`/onboard/${application?.onboardingId?._id}`}
                >
                  {application?.onboardingId?.status === 'completed'
                    ? 'View Onboarding Form'
                    : 'Start Onboarding'}
                </Button>
              </div>
            </div>
          </div>
        )}
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
        >
          <Avatar src={convertPublicFileURL(application?.tenantId?.logo ?? "")}>
            {application?.tenantId?.logo
              ? ''
              : application?.tenantId?.name?.slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Typography variant="subtitle1">{application?.jobId?.title}</Typography>
            <Typography variant="caption">{application?.tenantId?.name}</Typography>
            <div>
              <Typography variant="caption">
                {[
                  application?.jobId?.country?.names?.[dynamicLanguage],
                  application?.jobId?.city,
                  application?.jobId?.district,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </Typography>
            </div>
          </div>
        </Stack>
      </TableCell>
      <TableCell>
        <Chip
          label={t(application?.jobId?.locationType)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2">{t(application?.currentRecruitmentStepId?.title)}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={t(application?.jobId?.jobType)}
          size="small"
        />
      </TableCell>
      <TableCell width={150}>
        <Typography variant="body2">
          {new Date(application?.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell width={75}>
        <IconButton>
          <MoreVertOutlined />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function ApplicationListItem({ application }: { application: any }) {
  const [_searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const openApplicationDetail = (applicationId: string) => {
    setSearchParams((prev) => {
      prev.set('applicationId', applicationId);
      return prev;
    });
  };

  return (
    <ListItem
      key={application?._id}
      onClick={(e) => openApplicationDetail(application?._id)}
    >
      <ListItemAvatar>
        <Avatar src={application?.tenantId?.logo ?? ''}>
          {application?.tenantId?.logo
            ? ''
            : application?.tenantId?.name?.slice(0, 2).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={application?.jobId?.title}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              color="textPrimary"
            >
              {application?.tenantId?.name}
            </Typography>
            <br />
            {[application?.jobId?.country, application?.jobId?.city, application?.jobId?.district]
              .filter(Boolean)
              .join(' • ')}
          </>
        }
      />
    </ListItem>
  );
}
