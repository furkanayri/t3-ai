import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { SeverityPillColor } from 'src/components/severity-pill';
import { SeverityPill } from 'src/components/severity-pill';
import { AmountAndCurrencyStatus, CandidateOnboardingStatus } from '../../../../../types/CandidateOnboarding';

export const statusColorMapper: { [key in CandidateOnboardingStatus]: SeverityPillColor } = {
    completed: 'success',
    pending: 'info',
    cancelled: 'error',
    offerAccepted: 'success',
    "": 'error'
} as const;


export function OnboardingStatusChip({
    status,
    label,
}: {
    status: string;
    label?: ReactNode;
}) {
    const { t } = useTranslation()

    return (
        <SeverityPill
            color={statusColorMapper[status as keyof typeof statusColorMapper] as SeverityPillColor}
        >
            {label || t(status)}
        </SeverityPill>
    );
}

export const priceOfferstatusColorMapper: { [key in AmountAndCurrencyStatus]: SeverityPillColor } = {
    pending: 'info',
    reject: 'error',
    accepted: 'success',
    "": 'error'
} as const;
export function SalaryStatusChip({
    status,
    label,
}: {
    status: string;
    label?: ReactNode;
}) {

    const { t } = useTranslation()

    return (
        <SeverityPill
            color={priceOfferstatusColorMapper[status as keyof typeof priceOfferstatusColorMapper] as SeverityPillColor}>
            {label || t(status)}

        </SeverityPill>
    )
}
