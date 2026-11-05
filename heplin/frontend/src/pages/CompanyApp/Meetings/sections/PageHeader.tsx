import { LoadingButton } from '@mui/lab';
import { Stack, Typography, alpha } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';

export default function PageHeader({ mode }: { mode: "create" | "edit" }) {
  const { t } = useTranslation();
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
      <Typography variant="h4">
      {mode === "create" ? t('createNewMeeting') : t('edit_meeting')}
        </Typography>
      <Stack
        justifyContent="flex-end"
        direction="row"
        spacing={2}
      >
        <LoadingButton
          loading={isSubmitting}
          variant="contained"
          type="submit"
        >
          {t('saveMeeting')}
        </LoadingButton>
      </Stack>
    </Stack>
  );
}
