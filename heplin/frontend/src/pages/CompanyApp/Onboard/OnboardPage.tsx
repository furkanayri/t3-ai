import {
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Grid,
    OutlinedInput,
    Stack,
    Typography,
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { PageHeader } from './sections';
import {
    useGetMyEmployeeDataQuery,
    useGetOnboardingWorkflowDetailQuery,
    usePostNewOnboardingResponseMutation,
} from 'src/hooks/useServices';
import { useTranslation } from 'react-i18next';
import { ConfirmAction, FileUpload, FormSection } from 'src/components/shared';
import { useFormik } from 'formik';

type Item = {
    itemId: string;
    type: string;
    title: string;
    response: string;
};

export function Component() {
    const { t } = useTranslation();
    const myEmployeeDataQuery = useGetMyEmployeeDataQuery();

    const employee = myEmployeeDataQuery.data?.employee;

    const onboardingWorkflowId = employee?.onboardingWorkflowId;

    const onboardingWorkflowQuery = useGetOnboardingWorkflowDetailQuery({ id: onboardingWorkflowId });

    const workflowData = onboardingWorkflowQuery.data?.onboardingworkflow;

    const onboardingResponseMutation = usePostNewOnboardingResponseMutation();

    const { values, handleChange, setFieldValue, handleSubmit } = useFormik<{
        items: Item[];
    }>({
        initialValues: {
            items: [],
        },
        onSubmit: (vals, helpers) => {

            onboardingResponseMutation.mutate({
                items: vals.items,
                onboardingWorkflowId,
                employeeId: employee?._id
            }, {
                onSettled: () => {
                    helpers.setSubmitting(false);
                },
            });
        },
    });

    const handleRegistryChange = (event: any) => {
        const { value } = event.target;
        const isNumeric = /^[0-9]*$/;
        if (isNumeric.test(value)) {
            handleChange(event);
        }
    };

    return (
        <>
            <Seo title="Onboard Employee" />
            <Divider />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8,
                }}
            >
                <Container maxWidth={'xl'}>
                    <Grid
                        container
                        spacing={{
                            xs: 3,
                            lg: 4,
                        }}
                    >
                        <PageHeader />
                        <Grid
                            item
                            xs={12}
                        >
                            <FormSection title={t('requirements')}>
                                <Stack spacing={3}>
                                    {values.items.map((item, index) => {
                                        return (
                                            <Stack key={item?.itemId}>
                                                <Typography
                                                    variant="subtitle2"
                                                    mb={0.5}
                                                >
                                                    {item?.title}
                                                </Typography>
                                                {item?.type === 'text' ? (
                                                    <OutlinedInput
                                                        name={`items[${index}].response`}
                                                        value={item.response}
                                                        onChange={handleRegistryChange}
                                                        inputProps={{ maxLength: 26, inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: 100 }}
                                                    />
                                                ) : item?.type === 'file' ? (
                                                    <Stack>
                                                        <FileUpload
                                                            onUploadCompleted={(fileKey) => {
                                                                setFieldValue(`items[${index}].response`, fileKey);
                                                            }}
                                                        />
                                                        {item.response && (
                                                            <Stack
                                                                mt={1}
                                                                flexDirection={'row'}
                                                            >
                                                                <Chip label={item.response} />
                                                            </Stack>
                                                        )}
                                                    </Stack>
                                                ) : (
                                                    'No supported type'
                                                )}
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            </FormSection>
                            <Stack
                                mt={2}
                                flex={1}
                                flexDirection={'row'}
                                justifyContent={'flex-end'}
                            >
                                <ConfirmAction
                                    onConfirm={() => {
                                        return new Promise((resolve) => {
                                            handleSubmit();
                                            resolve(true);
                                        });
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        sx={{ minWidth: 150 }}
                                    >
                                        {t('send')}
                                    </Button>
                                </ConfirmAction>
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}

Component.displayName = 'OnboardingPage';
