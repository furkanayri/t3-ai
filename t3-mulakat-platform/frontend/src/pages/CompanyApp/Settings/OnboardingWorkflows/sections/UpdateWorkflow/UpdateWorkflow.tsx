import { useTranslation } from 'react-i18next';
import { useUpdateOnboardingWorkflowMutation, useGetOnboardingWorkflowDetailQuery } from 'src/hooks/useServices';
import { WorkflowForm } from '../WorkflowForm';
import { Alert, CircularProgress } from '@mui/material';

export default function UpdateWorkflow({ goBack, id }: {
    goBack: () => void,
    id?: string
}) {
    const { t } = useTranslation();

    const workflowDetailQuery = useGetOnboardingWorkflowDetailQuery({ id: id! })
    const updateOnboardingWorkflowMutation = useUpdateOnboardingWorkflowMutation();


    const workflow = workflowDetailQuery.data?.onboardingworkflow

    if (!id) return <Alert severity="error">{t('No id provided')}</Alert>

    if (workflowDetailQuery.isFetching) return <CircularProgress />

    if (workflowDetailQuery.isError) return <Alert severity="error">{t('Error fetching workflow')}</Alert>

    return (
        <WorkflowForm
            goBack={goBack}
            header={{
                title: t("update_workflow"),
                actionText: t("Save")
            }}
            initialValues={{
                title: workflow?.title || '',
                description: workflow?.description || '',
                items: workflow?.items || [],
            }}
            onSubmit={(values, helpers) => {
                updateOnboardingWorkflowMutation.mutate({
                    id: id!,
                    payload: values
                }, {
                    onSuccess: () => {
                        goBack();
                    },
                    onSettled: () => {
                        helpers.setSubmitting(false);
                    }
                });
            }}
        />
    );
}
