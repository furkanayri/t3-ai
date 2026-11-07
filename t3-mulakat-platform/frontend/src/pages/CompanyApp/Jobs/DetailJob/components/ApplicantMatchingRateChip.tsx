import { Tooltip, Typography } from '@mui/material';
import { green, grey, red } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';

const applicantMatchingRateColor = (rate: string | number) =>
  +rate < 50
    ? { bgcolor: red['50'], color: red['500'] }
    : +rate > 70
      ? { bgcolor: green['50'], color: green['600'] }
      : { bgcolor: grey['100'], color: grey['700'] };

export default function ApplicantMatchingRateChip({ rate }: { rate: string | number }) {
  const { t, i18n } = useTranslation()
  const matchingRatePercentage = i18n.language === 'tr' ? ` %${rate}` : ` ${rate}%`

  return (
    <Tooltip title={t("candidateScore") + matchingRatePercentage}>
      <Typography
        variant="caption"
        {...applicantMatchingRateColor(rate)}
        className="px-2 py-1 rounded-md"
      >
        {matchingRatePercentage}
      </Typography>
    </Tooltip>
  );
}
