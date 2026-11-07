import { LoadingButton } from '@mui/lab';
import { Stack, Typography, alpha } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';

export default function PageHeader() {
  const { t } = useTranslation();
  const { isSubmitting } = useFormikContext();
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        zIndex: 99,
        paddingBlock: '2rem',
      }}
    >
      <Typography variant="h3" sx={{
        fontWeight: 700,
        color: '#1a1a1a',
        fontSize: { xs: '1.75rem', md: '2.25rem' }
      }}>
        {t('newJobPost')}
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
          sx={{
            backgroundColor: '#E31E24',
            color: 'white',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '10px 24px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#C41B20',
            },
          }}
        >
          {t('saveAsDraft')}
        </LoadingButton>
      </Stack>
    </Stack>
  );
}
