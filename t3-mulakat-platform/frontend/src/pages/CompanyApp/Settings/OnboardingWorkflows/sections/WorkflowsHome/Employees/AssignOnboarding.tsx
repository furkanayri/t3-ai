import { LoadingButton } from '@mui/lab';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useAssignOnboardingWorkflowMutation,
    useGetAllOnboardingWorkflowsQuery,
} from 'src/hooks/useServices';
import { array } from 'src/utils';

export default function AssignOnboarding({
    employeeId,
    employeeName,
    onClose,
}: {
    employeeId: null | string;
    employeeName: string | null;
    onClose: (success?: boolean) => void;
}) {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedWorkflow, setSelectedWorkflow] = useState('');
    const workflowsQuery = useGetAllOnboardingWorkflowsQuery();

    const assignOnboardingMutation = useAssignOnboardingWorkflowMutation();

    const workflowsData = array<any>(workflowsQuery.data?.results);

    const handleClose = (success?: boolean) => {
        setSelectedWorkflow('');
        onClose(success || false);
    };

    const handleSubmit = () => {
        if (!employeeId || !selectedWorkflow) return Promise.reject();
        return assignOnboardingMutation.mutateAsync(
            {
                id: selectedWorkflow,
                payload: {
                    employeeId,
                },
            },
            {
                onSuccess: () => {
                    enqueueSnackbar({
                        message: t('Successfully assigned'),
                        variant: 'success',
                    });
                    handleClose(true);
                },
                onError: (error: any) => {
                    enqueueSnackbar({
                        message: error?.response?.data?.message || error?.message,
                        variant: 'error',
                    });
                },
            }
        );
    };
    return (
        <Dialog
            open={!!employeeId}
            onClose={() => handleClose()}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                {t('Assign workflow')}: {employeeName || ''}
            </DialogTitle>
            <DialogContent>
                <Stack sx={{ mt: 1, mb: 3 }}>
                    <TextField
                        select
                        label={t('Workflow')}
                        value={selectedWorkflow}
                        onChange={(e) => setSelectedWorkflow(e.target.value)}
                    >
                        {workflowsData.map((w) => {
                            return (
                                <MenuItem
                                    key={w?._id}
                                    value={w?._id}
                                >
                                    {w?.title}
                                </MenuItem>
                            );
                        })}
                    </TextField>
                </Stack>
                <DialogActions>
                    <Button onClick={() => handleClose()}>{t('Cancel')}</Button>
                    <LoadingButton
                        loading={assignOnboardingMutation.isLoading}
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        {t('Assign')}
                    </LoadingButton>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}
