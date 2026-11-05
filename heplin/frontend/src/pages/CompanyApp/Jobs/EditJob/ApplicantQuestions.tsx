import { Alert, Box, CircularProgress, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useRouter } from 'src/hooks/use-router';
import {
  useGetJobDetailQuery,
  useUpdateApplicantQuestionsOfJobMutation,
} from 'src/hooks/useServices';
import PageHeader from './PageHeader';
import QuestionForm from '../CreateJob/sections/QuestionForm';
import PageFooter from './PageFooter';
import { useParams } from 'react-router';
import { array } from 'src/utils';
import { jobApplicantFormSchema } from 'src/validations';
import { JobApplicantQuestionForm } from 'src/types/jobPost';
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation()
  const { id, companySlug } = useParams();
  const jobId = id ?? '';

  const detailJobQuery = useGetJobDetailQuery({ id: jobId });
  const updateQuestionForm = useUpdateApplicantQuestionsOfJobMutation();
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const jobDetail = detailJobQuery?.data?.job

  if (detailJobQuery.isLoading) return <CircularProgress />;

  if (detailJobQuery.isError)
    return <Alert severity="error">{(detailJobQuery.error as any)?.message}</Alert>;

  if (!jobDetail) return <Alert severity="warning">{t('jobNotFound')}</Alert>;

  const initialValues: JobApplicantQuestionForm = {
    applicantForm: array<any>(jobDetail?.applicantForm),
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
            return updateQuestionForm.mutate(
              { id: jobId, payload: values, },
              {
                onSuccess: (data) => {
                  enqueueSnackbar(t('The general info was successfully updated'), {
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
          validationSchema={jobApplicantFormSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader title={jobDetail?.title} />
                <QuestionForm />
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
