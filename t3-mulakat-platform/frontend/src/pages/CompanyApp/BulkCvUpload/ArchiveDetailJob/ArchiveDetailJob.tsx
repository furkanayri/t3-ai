import { Box, Container, Stack } from '@mui/material';
import ArchiveJobPageHeader from './sections/ArchiveJobPageHeader';
import ArchiveDetailJobTabs from './sections/ArchiveDetailJobTabs';
import { Outlet } from 'react-router';
import { CandidateApplicationDetail } from '../../Jobs/DetailJob/sections/CandidateApplicantDetail';
import ArchiveCandidateApplicantDetailDrawer from './sections/ArchiveCandidateApplicantDetail.tsx/ArchiveCandidateApplicantDetail';

export function Component() {
    return (

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
                    <ArchiveJobPageHeader />
                    <ArchiveDetailJobTabs />
                    <Outlet />
                    <ArchiveCandidateApplicantDetailDrawer />
                </Stack>
            </Container>
        </Box>

    );
}

Component.displayName = 'DetailJobScreen';
