import { Box, Container, Stack } from '@mui/material';
import { PageHeader } from './sections';
import { Outlet } from 'react-router';
import { default as JobDetailProvider } from './context';
import { Seo } from 'src/components/seo';


export function Component() {
  return (
    <>
      <Seo title="Job Detail" />
      <JobDetailProvider>
        <Box
          component="main"
          flexGrow={1}
        >
          <Container maxWidth="xl">
            <Stack
              spacing={3}
              sx={{ mb: 3 }}
            >
              <PageHeader />
              <Outlet />
            </Stack>
          </Container>
        </Box>
      </JobDetailProvider>
    </>
  );
}
Component.displayName = 'DetailJobScreen';
