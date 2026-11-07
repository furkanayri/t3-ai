import { Box, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import PageHeader from '../sections/PageHeader';
import GeneralForm from '../sections/GeneralForm';
import { Meeting } from 'src/types';
import { usePostNewMeetingMutation } from 'src/hooks/useServices/useMeetingServices';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useRouter } from 'src/hooks/use-router';
import { useTranslation } from 'react-i18next';

const initialValues: Meeting = {
  jobId: '',
  candidateId: '',
  recruitmentStageStepId: '',
  createdBy: '',
  type: "onsite",
  notes: "",
  privateNotes: "",
  date: new Date(),
  timezone: "",
  status: "initial",
  tenantId: "",
  title: "",
  hostId: "",
  zoomMeetingId: "",
  attendees: []
};


export function Component() {
  const { t } = useTranslation();
  const router = useRouter();
  const { companySlug } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const postNewMeetingMutation = usePostNewMeetingMutation()

  return (
    <Box
      component="main"
      flexGrow={1}
    >
      <Container maxWidth="xl">
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            postNewMeetingMutation.mutateAsync(
              {
                ...values
              },
              {
                onSuccess: (data) => {
                  enqueueSnackbar(t('created_meeting'), { variant: 'success' });
                  router.push(`/${companySlug}/meetings`);
                },
                onError: (err) => {
                  enqueueSnackbar((err as any).message, { variant: 'error' });
                },
              }
            )
          }}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader mode="create" />
                <GeneralForm />
              </Stack>
            </form>
          )}
        </Formik>
      </Container>
    </Box>
  );
}

Component.displayName = 'CreateCandidate';
