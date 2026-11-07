import { Alert, Box, CircularProgress, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useRouter } from 'src/hooks/use-router';
import { useGetJobDetailQuery, useUpdateDescriptionOfJobMutation } from 'src/hooks/useServices';
import PageHeader from './PageHeader';
import ContentForm from '../CreateJob/sections/ContentForm';
import PageFooter from './PageFooter';
import { jobContentSchema } from 'src/validations';
import { useParams } from 'react-router';
import { JobDescriptionForm } from 'src/types/jobPost';
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation()

  const { id, companySlug } = useParams();
  const jobId = id ?? '';

  const detailJobQuery = useGetJobDetailQuery({ id: jobId, });
  const updateDescriptionOfJob = useUpdateDescriptionOfJobMutation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const jobDetail = detailJobQuery?.data?.job

  if (detailJobQuery.isLoading) return <CircularProgress />;

  if (detailJobQuery.isError)
    return <Alert severity="error">{(detailJobQuery.error as any)?.message}</Alert>;

  if (!jobDetail) return <Alert severity="warning">{t('jobNotFound')}</Alert>;

  const initialValues: JobDescriptionForm = {
    content: jobDetail?.content,
  };

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
            return updateDescriptionOfJob.mutate(
              { id: jobId, payload: values, },
              {
                onSuccess: (data) => {
                  enqueueSnackbar('The general info was successfully updated', {
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
          validationSchema={jobContentSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader title={jobDetail?.title} />
                <ContentForm />
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
