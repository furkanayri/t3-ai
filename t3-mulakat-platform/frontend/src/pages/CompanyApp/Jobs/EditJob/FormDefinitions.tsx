import { Alert, Box, CircularProgress, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useRouter } from 'src/hooks/use-router';
import { useGetJobDetailQuery, useUpdateFormFieldsMutation } from 'src/hooks/useServices';
import PageHeader from './PageHeader';
import FormDefinitions from '../CreateJob/sections/FormDefinitions';
import PageFooter from './PageFooter';
import { jobFieldsSchema } from 'src/validations';
import { array } from 'src/utils';
import { useParams } from 'react-router';
import { useMemo } from 'react';
import { JobFormFields } from 'src/types/jobPost';
import { useTranslation } from 'react-i18next';

const model = (data: any): JobFormFields => ({
  fields: [
    { type: 'name_surname', isRequired: true, isVisible: true },
    { type: 'email', isRequired: true, isVisible: true },
    { type: 'phone', isRequired: true, isVisible: true },
    { type: 'cv', isRequired: true, isVisible: true },
    {
      type: 'coverLetter',
      isRequired: false,
      isVisible: true,
    },
    {
      type: 'currentCompany',
      isRequired: false,
      isVisible: true,
    },
  ].map((field) => {
    const findedField = array<any>(data?.fields).find((f) => f?.type === field?.type);

    if (!findedField) return field;

    return {
      type: field.type,
      isRequired: findedField?.isRequired,
      isVisible: findedField?.isVisible,
    };
  }),
});

export function Component() {
  const { t } = useTranslation()
  const { id, companySlug } = useParams();
  const jobId = id ?? '';

  const detailJobQuery = useGetJobDetailQuery({ id: jobId, });
  const updateFormFieldsOfJob = useUpdateFormFieldsMutation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const jobDetail = detailJobQuery?.data?.job
  const initialValues = useMemo(() => {
    return model(jobDetail);
  }, [jobDetail]);

  if (detailJobQuery.isLoading) return <CircularProgress />;

  if (detailJobQuery.isError)
    return <Alert severity="error">{(detailJobQuery.error as any)?.message}</Alert>;

  if (!jobDetail) return <Alert severity="warning">{t('jobNotFound')}</Alert>;

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
            return updateFormFieldsOfJob.mutate(
              { id: jobId, payload: values, },
              {
                onSuccess: (data) => {
                  enqueueSnackbar(t('The form fields was successfully updated'), {
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
          validationSchema={jobFieldsSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader title={jobDetail?.title} />
                <FormDefinitions />
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
