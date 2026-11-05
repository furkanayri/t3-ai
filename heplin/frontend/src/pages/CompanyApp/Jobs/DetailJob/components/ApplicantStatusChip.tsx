import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { SeverityPillColor } from 'src/components/severity-pill';
import { SeverityPill } from 'src/components/severity-pill';
import { getStepColorHex } from 'src/utils';
import { Box } from '@mui/material';

export const statusColorMapper: { [key: string]: SeverityPillColor } = {
  applied: 'info',
  interview: 'warning',
  rejected: 'error',
  offer: 'primary',
  hired: 'success',
} as const;

export default function ApplicantStatusChip({
  status,
  label,
  stepColor,
}: {
  status: string;
  label?: ReactNode;
  stepColor?: string;
}) {
  const { t } = useTranslation()

  // Eğer status disqualified ise özel tasarım kullan
  if (status === 'disqualified') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '24px',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          padding: '8px 20px',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'capitalize',
          letterSpacing: 0.3,
          border: '1px solid #FECACA',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: '#FEF2F2',
          }
        }}
      >
        {label || t(status)}
      </Box>
    );
  }

  // Step için özel renk varsa onu kullan
  if (stepColor) {
    const hexColor = getStepColorHex(stepColor as keyof typeof getStepColorHex);
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '24px',
          backgroundColor: `${hexColor}15`,
          color: hexColor,
          padding: '8px 20px',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'capitalize',
          letterSpacing: 0.3,
          border: `1px solid ${hexColor}30`,
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: `${hexColor}25`,
            borderColor: `${hexColor}50`
          }
        }}
      >
        {label || t(status)}
      </Box>
    );
  }

  // Varsayılan SeverityPill davranışı
  return (
    <SeverityPill
      color={statusColorMapper[status as keyof typeof statusColorMapper] as SeverityPillColor || 'info'}
    >
      {label || t(status)}
    </SeverityPill>
  );
}
