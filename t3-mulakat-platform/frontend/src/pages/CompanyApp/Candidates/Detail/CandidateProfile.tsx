import { Chip, Divider, Typography } from '@mui/material';
import { Stack } from '@mui/system';

export default function CandidateProfile() {
  return (
    <>
      <Stack
        spacing={3}
        sx={{ mt: 1, mx: 1 }}
      >
        <Stack spacing={1}>
          <Typography variant="h6">Education</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Education will be seen here
          </Typography>
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="h6">Experiences</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Experiencess will be seen here
          </Typography>
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="h6">Projects</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Projects will be seen here
          </Typography>
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="h6">Files</Typography>
          <Stack
            direction="row"
            spacing={2}
          >
            <Chip
              label="View CV"
              clickable
            ></Chip>
            <Chip
              label="View Cover Letter"
              clickable
            ></Chip>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
