import { useTranslation } from 'react-i18next';
import EmployeeForm from './EmployeeForm';
import { usePostNewEmployeeMutation } from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';

export default function CreateEmployee({
    isVisible,
    onClose,
}: {
    onClose: (isSuccess?: boolean) => void;
    isVisible: boolean;
}) {
    const createEmployeMutation = usePostNewEmployeeMutation();
    const { enqueueSnackbar } = useSnackbar();

    const { t } = useTranslation();
    return (
        <EmployeeForm
            isVisible={isVisible}
            onClose={onClose}
            header={{
                title: t('add_employee'),
                actionText: t('add_employee'),
            }}
            onSubmit={async (vals, helpers) => {
                try {
                    await createEmployeMutation.mutateAsync(vals);
                    enqueueSnackbar(t('employee_created'), { variant: 'success' });
                    helpers.resetForm()
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
