import { useTranslation } from 'react-i18next';
import { usePostNewOnboardingWorkflowMutation } from 'src/hooks/useServices';
import { WorkflowForm } from '../WorkflowForm';

export default function CreateWorkflow({ goBack }: {
    goBack: () => void,
}) {
    const { t } = useTranslation();
    const createOnboardingWorkflowMutation = usePostNewOnboardingWorkflowMutation();

    return (
        <WorkflowForm
            goBack={goBack}
            header={{
                title: t("create_new_workflow"),
                actionText: t("Save")
            }}
            initialValues={{
                title: '',
                description: '',
                items: [],
            }}
            onSubmit={(values, helpers) => {
                createOnboardingWorkflowMutation.mutate(values, {
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
