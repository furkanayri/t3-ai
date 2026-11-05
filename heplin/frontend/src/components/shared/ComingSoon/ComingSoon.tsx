import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function ComingSoon() {
  const { t } = useTranslation();
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center flex items-center justify-center z-40">
      <div className="absolute top-0 left-0 right-0 bottom-0 blur bg-white bg-opacity-95 z-40"></div>
      <Typography
        variant="subtitle1"
        sx={{ zIndex: 100, position: 'absolute', color: 'text.secondary' }}
      >
        {t('comingSoon')}
      </Typography>
    </div>
  );
}
