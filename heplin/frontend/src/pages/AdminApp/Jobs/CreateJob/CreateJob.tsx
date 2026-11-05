import { Box, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';
import {
  ContentForm,
  GeneralForm,
  PageHeader,
  LocationForm,
  QuestionForm,
  SkilssForm,
  FormDefinitions,
  SelectTenant,
} from './sections';
import { jobValidationSchema } from 'src/validations';
import SelectChannel from './sections/SelectChannel';
import { useCreateJobMutation } from 'src/hooks/useServices/admin';
import { useParams } from 'react-router-dom';
import { JobForm } from '../../../../types/jobPost';
import { useRouter } from 'src/hooks/use-router';
const initialValues: JobForm = {
  title: '',
  categoryId: '',
  jobType: '',
  locationType: '',
  country: {
    names: {
      en: '',
      tr: '',
    },
  },
  city: '',
  district: '',
  content: '',
  recruitmentStageId: '',
  endDate: new Date(),
  applicantForm: [],
  hiringTeams: [],
  skills: [],
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
  ],
  seoTitle: '',
  seoDescription: '',
  tenantId: '',
  publishedChannels: [],
  aiInterview: 'no'
};

export const Component = () => {
  // const postNewJobMutation = usePostNewJobMutation();
  const postNewJobMutation = useCreateJobMutation();
  const router = useRouter();
  const { companySlug } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  return (
    <Box
      component="main"
      flexGrow={1}
    >
      <Container maxWidth="xl">
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => {


            const payload = {
              ...values,
              hiringTeams: values?.hiringTeams?.map((e) => e?._id),
              seoTitle: values?.title,
              seoDescription: values?.title,
            }

            await postNewJobMutation.mutateAsync({ payload, tenantId: values.tenantId! },
              {
                onSuccess: (data: any) => {
                  enqueueSnackbar('Created new job as draft', { variant: 'success' });
                  router.push(`/jobs/${data?._id}`)

                },
                onError: (err: any) => {
                  enqueueSnackbar((err as any).message, { variant: 'error' });
                },
              }
            );
          }}
          validationSchema={jobValidationSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader />
                <SelectTenant />
                <SelectChannel />
                <GeneralForm />
                <LocationForm />
                <ContentForm />
                {/* <SkilssForm /> */}
                <FormDefinitions />
                <QuestionForm />
              </Stack>
            </form>
          )}
        </Formik>
      </Container>
    </Box>
  );
};

Component.displayName = 'CreateJob';
