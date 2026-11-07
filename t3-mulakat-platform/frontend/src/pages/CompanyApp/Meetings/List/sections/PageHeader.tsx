import { Add, } from '@mui/icons-material';
import { Button, Stack, Typography, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function PageHeader() {
  const { t } = useTranslation();
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        flex: '1 1 0%',
        position: 'sticky',
        top: 64,
        backdropFilter: 'blur(6px)',
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
        zIndex: 99,
        paddingBlock: '1rem',
      }}
    >
      <Typography variant="h4">{t('meetings')}</Typography>
      <Stack
        justifyContent="flex-end"
        direction="row"
        spacing={2}
      >
        <Link to={'create'}>
          <Button
            variant="contained"
            type="submit"
            startIcon={<Add />}
          >
            {t('createNewMeeting')}
          </Button>
        </Link>
      </Stack>
    </Stack>
  );
}
