import { Box, Container, Stack } from '@mui/material';
import DetailJobProvider from './DetailJobProvider';
import { DetailJobTabs, PageHeader } from './sections';
import { Outlet } from 'react-router';
import { CandidateApplicationDetail } from './sections/CandidateApplicantDetail';

export function Component() {
  return (
    <DetailJobProvider>
      <Box
        component="main"
        flexGrow={1}
      >
        <Container
          maxWidth='xl'
          sx={{
            '@media (max-width: 1600px)': {
              maxWidth: 'lg',
            },
          }}
        >
          <Stack
            spacing={3}
            sx={{ mb: 3 }}
          >
            <PageHeader />
            <DetailJobTabs />
            <Outlet />
            <CandidateApplicationDetail />
            
          </Stack>
        </Container>
      </Box>
    </DetailJobProvider>
  );
}

Component.displayName = 'DetailJobScreen';
