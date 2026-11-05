import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import VideocamIcon from '@mui/icons-material/Videocam';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useTranslation } from 'react-i18next';
import { useTenantQuotaQuery } from 'src/hooks/useServices/useQuotaService';

interface JobApplication {
  jobId: {
    _id: string;
    title: string;
  };
  totalLimit: number;
  remainingApplications: number;
  _id: string;
}

const FIXED_CARD_HEIGHT = 180;

const GradientPaper = styled(Paper)(({ theme, color }: { theme?: any; color: string }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${color}AA 0%, ${color}55 100%)`,
  color: '#000',
  boxShadow: theme.shadows[4],
  transition: 'box-shadow 0.2s ease-in-out',
  height: FIXED_CARD_HEIGHT,
  display: 'flex',
  flexDirection: 'column',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const ScrollableContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
});

function Quotas() {
  const { t } = useTranslation();
  const quotasQuery = useTenantQuotaQuery();
  const quatas = quotasQuery?.data;

  const renderQuotaCard = (
    color: string,
    title: string,
    IconComponent: React.ElementType,
    credit: number | string,
    remaining: number | string,
    extraInfo?: React.ReactNode,
    creditLabel?: string
  ) => (
    <GradientPaper color={color}>
      <ScrollableContent>
        <IconWrapper>
          <IconComponent fontSize="large" sx={{ color }} />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold', color }}>
            {title}
          </Typography>
        </IconWrapper>
        <Typography variant="body1">
          {creditLabel ? creditLabel : t('credit')}: <strong>{credit}</strong>
        </Typography>
        <Typography variant="body1">
          {t('remainingcredit')}: <strong>{remaining}</strong>
        </Typography>
        {extraInfo && <Box mt={1}>{extraInfo}</Box>}
      </ScrollableContent>
    </GradientPaper>
  );

  return (
    <Box
      sx={{

        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 1100, width: '100%' }}>
        <CardContent>
          <Grid container spacing={4} alignItems="stretch" justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              {renderQuotaCard('#EC407A', t('email'), EmailIcon, quatas?.email?.credit, quatas?.email?.remainingCredit)}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {renderQuotaCard('#FFA726', t('job'), WorkIcon, quatas?.job?.credit, quatas?.job?.remainingCredit)}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {renderQuotaCard(
                '#66BB6A',
                t('Interview'),
                AccountTreeIcon,
                quatas?.aiFeatures?.interview?.maxAllowed,
                quatas?.aiFeatures?.interview?.remainingCount,
                <Typography variant="body2">
                  {t('active')}: <strong>
                    {quatas?.aiFeatures?.interview?.isActive === true
                      ? 'Yes'
                      : quatas?.aiFeatures?.interview?.isActive === false
                        ? 'No'
                        : 'Limitless'}
                  </strong>
                </Typography>,
                t('maxAllowed')
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {renderQuotaCard(
                '#AB47BC',
                t('VideoInterview'),
                VideocamIcon,
                quatas?.aiFeatures?.videoInterview?.maxAllowed,
                quatas?.aiFeatures?.videoInterview?.remainingCount,
                <Typography variant="body2">
                  {t('active')}: <strong>
                    {quatas?.aiFeatures?.videoInterview?.isActive === true
                      ? 'Yes'
                      : quatas?.aiFeatures?.videoInterview?.isActive === false
                        ? 'No'
                        : 'Limitless'}
                  </strong>
                </Typography>,
                t('maxAllowed')
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              {renderQuotaCard(
                '#eb6834',
                t('Ai Evaluation'),
                AssessmentIcon,
                quatas?.aiFeatures?.evaluation?.maxAllowed,
                quatas?.aiFeatures?.evaluation?.remainingCount,
                <Typography variant="body2">
                  {t('active')}: <strong>
                    {quatas?.aiFeatures?.evaluation?.isActive === true
                      ? 'Yes'
                      : quatas?.aiFeatures?.evaluation?.isActive === false
                        ? 'No'
                        : 'Limitless'}
                  </strong>
                </Typography>,
                t('maxAllowed')
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <GradientPaper color="#42A5F5">
                <ScrollableContent>
                  <IconWrapper>
                    <WorkHistoryIcon fontSize="large" sx={{ color: '#42A5F5' }} />
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold', color: '#42A5F5' }}>
                      {t('jobApplications')}
                    </Typography>
                  </IconWrapper>
                  {quatas?.jobApplications?.length <= 0 ? (
                    <Typography variant="body1">
                      <strong>{t('There are no applications')}</strong>
                    </Typography>
                  ) : (
                    quatas?.jobApplications?.map((jobApplication: JobApplication) => (
                      <Box key={jobApplication._id} sx={{ mb: 2, borderBottom: '1px solid rgba(0,0,0,0.3)', pb: 1 }}>
                        <Typography variant="body2">
                          {t('Title')}: <strong>{jobApplication?.jobId?.title}</strong>
                        </Typography>
                        <Typography variant="body2">
                          {t('total')} {t('Limit')}: <strong>{jobApplication?.totalLimit}</strong>
                        </Typography>
                        <Typography variant="body2">
                          {t('remainingcredit')}: <strong>{jobApplication?.remainingApplications}</strong>
                        </Typography>
                      </Box>
                    ))
                  )}
                </ScrollableContent>
              </GradientPaper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Quotas;
