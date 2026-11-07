import { Alert, Box, CircularProgress, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useRouter } from 'src/hooks/use-router';
import { useGetJobDetailQuery, useUpdateGeneralInfoOfJobMutation } from 'src/hooks/useServices';
import PageHeader from './PageHeader';
import GeneralInfo from '../CreateJob/sections/GeneralForm';
import LocationForm from '../CreateJob/sections/LocationForm';

import PageFooter from './PageFooter';
import { useParams } from 'react-router';
import { jobGeneralInfoSchema } from 'src/validations';
import { useTranslation } from 'react-i18next';

const generalInfo = (data: any) => ({
  title: data?.title ?? '',
  categoryId: data?.categoryId?._id ?? data?.categoryId ?? '',
  jobType: data?.jobType ?? '',
  locationType: data?.locationType ?? '',
  country: {
    names: {
      en: data?.country?.names?.en ?? '',
      tr: data?.country?.names?.tr ?? '',
    }
  },
  city: data?.city ?? '',
  district: data?.district ?? '',
  recruitmentStageId: data?.recruitmentStageId ?? "",
  teamId: data?.teamId ?? '',
  hiringTeams: data?.hiringTeams ?? [],
  endDate: new Date(data?.endDate) ?? new Date(),
});

export function Component() {
  const { t } = useTranslation();
  const { id, companySlug } = useParams();
  const jobId = id ?? '';

  const detailJobQuery = useGetJobDetailQuery({ id: jobId, });
  const updateGeneralInfoOfJob = useUpdateGeneralInfoOfJobMutation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const jobDetail = detailJobQuery?.data?.job

  if (detailJobQuery.isLoading) return <CircularProgress />;

  if (detailJobQuery.isError)
    return <Alert severity="error">{(detailJobQuery.error as any)?.message}</Alert>;

  if (!jobDetail) return <Alert severity="warning">{t('jobNotFound')}</Alert>;

  const initialValues = generalInfo(jobDetail);

  return (
    <Box
      component="main"
      flexGrow={1}
    >
      <Container maxWidth="xl">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          onSubmit={(values, helpers) => {
            return updateGeneralInfoOfJob.mutate(
              { id: jobId, payload: values, },
              {
                onSuccess: (data) => {
                  enqueueSnackbar(t('generalInfoUpdated'), {
                    variant: 'success',
                  });
                  router.push(`/${companySlug}/jobs/${jobId}`);
                },
                onError: (err) => {
                  enqueueSnackbar((err as any).message, { variant: 'error' });
                },
                onSettled: () => {
                  helpers.setSubmitting(false);
                },
              }
            );
          }}
          validationSchema={jobGeneralInfoSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader title={jobDetail?.title} />
                <GeneralInfo />
                <LocationForm />
                <PageFooter />
              </Stack>
            </form>
          )}
        </Formik>
      </Container>
    </Box>
  );
}

Component.displayName = 'UpdateGeneralInfoJob';
