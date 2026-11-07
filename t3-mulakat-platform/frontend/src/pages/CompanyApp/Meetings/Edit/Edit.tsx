import { Box, Container, Stack, CircularProgress } from '@mui/material';
import { Formik } from 'formik';
import PageHeader from '../sections/PageHeader';
import { useAuth } from 'src/providers';
import GeneralForm from '../sections/GeneralForm';
import { Meeting } from 'src/types';
import { useUpdateMeetingMutation, useGetMeetingDetailQuery } from 'src/hooks/useServices/useMeetingServices';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useRouter } from 'src/hooks/use-router';
//import { PageHeader, GeneralInfo, CV, CoverLetter } from './sections';
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
  attendees: []
};


export function Component() {
  const { t } = useTranslation();
  const router = useRouter();
  const { companySlug, id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const updateMeetingMutation = useUpdateMeetingMutation()
  const { activeTenant } = useAuth()

  const meetingQuery = useGetMeetingDetailQuery(id ?? "");
  const meeting: Meeting = meetingQuery?.data?.meeting;
  if (meetingQuery.isFetching) return <CircularProgress sx={{ mx: "auto" }} />

  const initialValues: any = {
    title: meeting?.title ?? '',
    hostId: meeting?.hostId ?? '',
    type: meeting?.type ?? "onsite",
    notes: meeting?.notes ?? "",
    date: new Date(meeting?.date) ?? new Date(),
    jobId: meeting.jobId ?? '',
    candidateId: meeting.candidateId ?? '',
    privateNotes: meeting.privateNotes ?? '',
    zoomMeetingId: meeting.zoomMeetingId ?? ''
  };
  return (
    <Box
      component="main"
      flexGrow={1}
    >
      <Container maxWidth="xl">
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            updateMeetingMutation.mutateAsync(
              {
                id: id ?? "", payload: values
              },
              {
                onSuccess: (data) => {
                  enqueueSnackbar(t('updated_meeting'), { variant: 'success' });
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
                <PageHeader mode="edit" />
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
