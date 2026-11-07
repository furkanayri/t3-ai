import { ReactNode } from 'react';
import type { SeverityPillColor } from 'src/components/severity-pill';
import { SeverityPill } from 'src/components/severity-pill';

export const statusColorMapper: { [key: string]: SeverityPillColor } = {
  active: 'primary',
  archived: 'info',
  closed: 'warning',
} as const;

export default function JobStatusChip({
  status,
  label,
}: {
  status: string;
  label?: ReactNode;
}) {
  return (
    <SeverityPill
      color={statusColorMapper[status as keyof typeof statusColorMapper] as SeverityPillColor}
    >
      {label || status}
    </SeverityPill>
  );
}


