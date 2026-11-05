import { LoadingButton } from '@mui/lab';
import { Stack, Typography, alpha } from '@mui/material';
import { useFormikContext } from 'formik';

export default function PageHeader({ title }: { title: string }) {
  const { isSubmitting } = useFormikContext();
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        position: 'sticky',
        top: 64,
        backdropFilter: 'blur(6px)',
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
        zIndex: 99,
        paddingBlock: '1rem',
      }}
    >
      <Typography variant="h4">{title}</Typography>
    </Stack>
  );
}
