import { Box, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { PageHeader, GeneralInfo, CV, CoverLetter } from './sections';

const initialValues = {
  name: '',
  surname: '',
  avatar: '',
  email: '',
  phone: '',
  cv: '',
  coverLetter: '',
};

export function Component() {
  // const { enqueueSnackbar } = useSnackbar();
  // const router = useRouter();
  return (
    <Box
      component="main"
      flexGrow={1}
    >
      <Container maxWidth="xl">
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            //   return postNewJobMutation.mutateAsync(values, {
            //     onSuccess: (data) => {
            //       enqueueSnackbar('Created new job as draft', { variant: 'success' });
            //       router.push(`/jobs/${data?.data?._id}`);
            //     },
            //     onError: (err) => {
            //       enqueueSnackbar((err as any).message, { variant: 'error' });
            //     },
            //   });
          }}
          // validationSchema={jobValidationSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack
                spacing={3}
                sx={{ mb: 3 }}
              >
                <PageHeader />
                <GeneralInfo />
                <CV />
                <CoverLetter />
              </Stack>
            </form>
          )}
        </Formik>
      </Container>
    </Box>
  );
}

Component.displayName = 'CreateCandidate';
