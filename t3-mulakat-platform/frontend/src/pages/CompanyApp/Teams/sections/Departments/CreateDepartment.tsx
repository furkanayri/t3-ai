import { useTranslation } from 'react-i18next';
import DepartmentForm from './DepartmentForm';
import { usePostNewDepartmentMutation } from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
export default function CreateDepartment({
    isVisible,
    onClose,
}: {
    onClose: (isSuccess?: boolean) => void;
    isVisible: boolean;
}) {
    const createDepartmentMutation = usePostNewDepartmentMutation();
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return (
        <DepartmentForm
            isVisible={isVisible}
            onClose={onClose}
            header={{
                title: t('create_department'),
                actionText: t('Create'),
            }}
            onSubmit={async (vals, helpers) => {
                try {
                    await createDepartmentMutation.mutateAsync(vals);
                    enqueueSnackbar(t('Department created successfully'), { variant: 'success' });
                    queryClient.invalidateQueries(['departments']);
                    onClose(true);
                } catch (error: any) {
                    enqueueSnackbar(error?.response?.data?.message || error?.message, { variant: 'error' });
                } finally {
                    helpers.setSubmitting(false);
                }
            }}
        />
    );
}
