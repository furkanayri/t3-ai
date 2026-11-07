import { useTranslation } from 'react-i18next';
import TeamForm from './TeamForm';
import { usePostNewTeamMutation } from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateTeam({
    isVisible,
    onClose,
}: {
    onClose: (isSuccess?: boolean) => void;
    isVisible: boolean;
}) {
    const createTeamMutation = usePostNewTeamMutation();
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const { t } = useTranslation();
    return (
        <TeamForm
            isVisible={isVisible}
            onClose={onClose}
            header={{
                title: t('create_team'),
                actionText: t('Create'),
            }}
            onSubmit={async (vals, helpers) => {
                try {
                    await createTeamMutation.mutateAsync(vals);
                    enqueueSnackbar(t('Team created successfully'), { variant: 'success' });
                    queryClient.invalidateQueries(['teams', "department"]);
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
