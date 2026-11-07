import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from 'src/components/shared';

import { JobStatusAction } from 'src/types/jobPost';

type ChangeStatusConfirmProps = {
    status: JobStatusAction;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
};

const JobStatusMapper: { [key in JobStatusAction]: any } = {
    active: {
        content: 'The job posting will be published immediately.',
        confirm: {
            text: 'Publish',
        },
    },
    closed: {
        content: 'The job posting will be closed new candidates.',
        confirm: {
            text: 'Close new candidates',
            color: 'red',
        },
    },
    archived: {
        content: 'The job posting will be archived.',
        confirm: {
            text: 'Archive',
        },
    },
    delete: {
        content: 'The job posting will be delete',
        confirm: {
            text: 'Delete',
            color: 'red',
        },
    },
    duplicate: {
        content: 'The job posting will be dublicated as draft',
        confirm: {
            text: 'Duplicate',
        },
    },
};
export default function ChangeStatusConfirm({
    status,
    open,
    onClose,
    onConfirm,
    isLoading,
}: ChangeStatusConfirmProps) {
    const { t } = useTranslation();
    const activeStatus: any = JobStatusMapper[status as keyof typeof JobStatusMapper];
    if (!open) return null;
    return (
        <ConfirmDialog
            title={t('doYouConfirm')}
            content={t(activeStatus?.content)}
            open={open}
            onClose={onClose}
            onConfirm={onConfirm}
            confirmText={t(activeStatus?.confirm?.text)}
            confirmColor={activeStatus?.confirm?.color}
            isLoading={isLoading}
        />
    );
}
