import { Box, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useRouter } from 'src/hooks/use-router';
import { useGetPostingChannelsOfUser, usePostNewJobMutation } from 'src/hooks/useServices';
import {
  ContentForm,
  GeneralForm,
  PageHeader,
  LocationForm,
  QuestionForm,
  SkilssForm,
  FormDefinitions,
  CloneJob,
  AiInteview,
} from './sections';
import { jobValidationSchema } from 'src/validations';
import { useParams } from 'react-router';
import { useAuth } from 'src/providers';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { useTenantQuotaQuery } from 'src/hooks/useServices/useQuotaService';

const initialValues = {
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
  requirements: '',
  recruitmentStageId: '',
  endDate: new Date(),
  applicantForm: [],
  employeesId: [],
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
  aiInterview: 'no',
  // teamId: ""
};

export const Component = () => {
  const postNewJobMutation = usePostNewJobMutation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { activeTenantId } = useAuth();
  const postingChannelsQuery = useGetPostingChannelsOfUser({
    tenantId: activeTenantId?.toString() || '',
  });
  const postingChannels = array(postingChannelsQuery.data?.results);
  const quotasQuery = useTenantQuotaQuery();
  const quatas = quotasQuery?.data;
  const { companySlug } = useParams();
  const { t } = useTranslation()
  return (
    <Box
      component="main"
      flexGrow={1}
    >
      <Container maxWidth="xl">
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {

            let skillId = values.skills.map((skill: any) => skill._id);
            return postNewJobMutation.mutateAsync(
              {
                ...values,
                skills: skillId,
                seoTitle: values?.title,
                seoDescription: values?.title,
                publishedChannels: postingChannels.map((channel: any) => ({
                  channelId: channel?._id,
                  status: 'published',
                  lastPublishedAt: new Date(),
                })),
              },
              {
                onSuccess: (data) => {
                  enqueueSnackbar(t('Created new job as draft'), { variant: 'success' });
                  router.push(`/${companySlug}/jobs/${data._id}`);
                },
                onError: (err: any) => {
                  enqueueSnackbar(t(((err.response.data as any).message)), { variant: 'error' });
                },
              }
            );
          }
          }
          validationSchema={jobValidationSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader />
                <CloneJob quatas={quatas} />
                <GeneralForm />
                <ContentForm />
                <LocationForm />

                {/* <SkilssForm /> */}
                <FormDefinitions />
                <QuestionForm />
                {/* <AiInteview quatas={quatas} /> */}
              </Stack>
            </form>
          )}
        </Formik>
      </Container>
    </Box>
  );
};

Component.displayName = 'CreateJob';
