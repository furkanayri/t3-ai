import { useTranslation } from 'react-i18next';
import TeamForm from './TeamForm';
import { useDeleteTeamMutation, useGetOneTeamQuery, useUpdateTeamMutation } from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';
import { Button, Stack } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { ConfirmAction } from 'src/components/shared';
import { array } from 'src/utils';

export default function UpdateTeam({
    id,
    isVisible,
    onClose,
}: {
    id?: string
    onClose: (isSuccess?: boolean) => void;
    isVisible: boolean;
}) {
    const teamQuery = useGetOneTeamQuery({ id: id! });

    const teamData = teamQuery.data?.team

    const updateTeamMutation = useUpdateTeamMutation();

    const deleteTeamMutation = useDeleteTeamMutation();
    const { enqueueSnackbar } = useSnackbar();

    const { t } = useTranslation();
    return (
        <TeamForm
            isVisible={isVisible}
            onClose={onClose}
            header={{
                title: <Stack flexDirection={"row"} alignItems={"center"} justifyContent={"space-between"}>
                    <div>
                        {teamData?.name ? `${teamData?.name} - ${t('team')}` : ""}
                    </div>
                    <ConfirmAction onConfirm={async () => {
                        return deleteTeamMutation.mutateAsync({
                            id: id!,
                        }, {
                            onSuccess: () => {
                                enqueueSnackbar(t('Team deleted successfully'), { variant: 'success' });
                                onClose(true);
                            },
                            onError: (error: any) => {
                                enqueueSnackbar(error?.response?.data?.message || error?.message, { variant: 'error' });
                            }
                        })
                    }}>
                        <Button size="small" color='error' startIcon={<Delete />}>
                            {t('Delete')}
                        </Button>
                    </ConfirmAction>
                </Stack>,
                actionText: t('update'),
            }}
            isFetching={teamQuery.isLoading}
            onSubmit={async (vals, helpers) => {
                try {
                    await updateTeamMutation.mutateAsync({ id: id!, payload: vals });
                    enqueueSnackbar(t('Team updated successfully'), { variant: 'success' });
                    onClose(true);
                } catch (error: any) {
                    enqueueSnackbar(error?.response?.data?.message || error?.message, { variant: 'error' });
                } finally {
                    helpers.setSubmitting(false);
                }
            }}
            initialValues={{
                name: teamData?.name || '',
                description: teamData?.description || '',
                departmentId: teamData?.departmentId || "",
                employees: array<any>(teamData?.employees).map(emp => emp?._id || emp)
            }}
        />
    );
}
