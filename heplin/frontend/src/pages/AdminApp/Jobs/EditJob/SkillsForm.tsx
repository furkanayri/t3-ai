import { Alert, Box, CircularProgress, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useRouter } from 'src/hooks/use-router';
import PageHeader from './PageHeader';
import { SkilssForm } from '../CreateJob/sections';
import PageFooter from './PageFooter';
import { useParams } from 'react-router';
import { array } from 'src/utils';
import { JobSkillsForm } from 'src/types/jobPost';
import { jobSkillsFormSchema } from 'src/validations';
import { useTranslation } from 'react-i18next';
import { useGetJobDetailQuery, useUpdateSkillsOfJobMutation } from '../../../../hooks/useServices/admin';

export function Component() {
  const { t } = useTranslation()
  const { id } = useParams();
  const jobId = id ?? '';

  const detailJobQuery = useGetJobDetailQuery({ jobId: jobId, });
  const updateSkills = useUpdateSkillsOfJobMutation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const jobDetail = detailJobQuery?.data?.job

  if (detailJobQuery.isLoading) return <CircularProgress />;

  if (detailJobQuery.isError)
    return <Alert severity="error">{(detailJobQuery.error as any)?.message}</Alert>;

  if (!jobDetail) return <Alert severity="warning">{t('jobNotFound')}</Alert>;

  const initialValues: JobSkillsForm = {
    skills: array<any>(jobDetail?.skills),
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
            return updateSkills.mutate(
              { jobId: jobId, payload: values, },
              {
                onSuccess: (data) => {
                  enqueueSnackbar('The skills info was successfully updated', {
                    variant: 'success',
                  });
                  router.push(`/jobs/${jobId}`);
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
          validationSchema={jobSkillsFormSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader title={(jobDetail?.title + " " + t("skills")) || ''} />
                <SkilssForm />
                <PageFooter />
              </Stack>
            </form>
          )}
        </Formik>
      </Container>
    </Box>
  );
}

Component.displayName = 'SkillsForm';
