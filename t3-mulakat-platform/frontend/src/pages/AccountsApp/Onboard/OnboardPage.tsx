import {
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Seo } from 'src/components/seo';
import { PageHeader } from './sections';

import { useTranslation } from 'react-i18next';
import { ConfirmAction, FileUpload, FormSection } from 'src/components/shared';
import { useFormik } from 'formik';
import { useParams } from 'react-router';
import { useGetMyOnboardingDetailQuery, useUpdateMyOnboardingMutation } from 'src/hooks/useServices';
import { OnboardingWorkflow } from 'src/types';
import { OnboardingResponseItem } from 'src/types/CandidateOnboarding';
import { useSnackbar } from 'notistack';
import { useRouter } from 'src/hooks/use-router';
import { useDialog } from 'src/hooks/use-dialog';
import AcceptJobDialog from './component/AcceptJobDialog';

export function Component() {
    const { t } = useTranslation();
    const { data, open, handleOpen, handleClose } = useDialog()
    const { onboardingId } = useParams()
    const { enqueueSnackbar } = useSnackbar();


    const updateMyOnboardingMutation = useUpdateMyOnboardingMutation();
    const onboardingDetailQuery = useGetMyOnboardingDetailQuery({ id: onboardingId ?? "" });
    const candidateOnboarding = onboardingDetailQuery?.data?.candidateOnboarding;
    const employee = candidateOnboarding?.employeeId;
    const candidate = candidateOnboarding?.candidateId;
    const job = candidateOnboarding?.jobId;
    const application = candidateOnboarding?.jobApplicationId;
    const workflow: OnboardingWorkflow = candidateOnboarding?.onboardingWorkflowId;
    const responses = candidateOnboarding?.responses;
    const router = useRouter()

    const { values, handleChange, setFieldValue, handleSubmit } = useFormik<{
        responses: OnboardingResponseItem[];
    }>({
        initialValues: {
            responses: workflow?.items?.map(item => {
                return {
                    itemId: item._id,
                    type: item.type,
                    title: item.title,
                    description: item.description,
                    status: 'completed',
                    response: responses?.find((response: any) => response.itemId === item._id)?.response ?? "",
                };
            }) ?? [],
        },
        onSubmit: (values) => {
            updateMyOnboardingMutation.mutate({ id: onboardingId ?? "", payload: values }, {
                onSuccess: () => {
                    enqueueSnackbar('Onboarding updated successfully', { variant: 'success' });
                    router.back()
                },
                onError: () => {
                    enqueueSnackbar('Failed to update onboarding', { variant: 'error' });
                }
            })
        },
        enableReinitialize: true,
    });


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
                <AcceptJobDialog
                    priceOffer={candidateOnboarding?.amountAndCurrency}
                    onClose={handleClose}
                    refetch={onboardingDetailQuery?.refetch}
                    open={candidateOnboarding?.status == 'pending'} />
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


                            <FormSection
                                title={job?.title}
                            >
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={3}>
                                            <Typography variant="h6" mb={1}>
                                                {t('Candidate')}
                                            </Typography>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2">
                                                    {t('Name')}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {`${candidate?.name} ${candidate?.surname}`}
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2">
                                                    {t('Email')}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {candidate?.email}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={3}>
                                            <Typography variant="h6" mb={1}>
                                                {t('Employee')}
                                            </Typography>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2">
                                                    {t('Name')}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {`${employee?.name} ${employee?.surname}`}
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2">
                                                    {t('Email')}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {employee?.email}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </FormSection>
                            <div className='my-2'>
                                <Divider />
                            </div>

                            <FormSection
                                title={workflow?.title}
                                description={workflow?.description}
                            >
                                <Stack spacing={3}>

                                    {values.responses.map((item, index) => {

                                        return (
                                            <Stack key={item?.itemId}>

                                                <Typography variant="subtitle2" mb={0.5}>
                                                    {item?.title}
                                                </Typography>
                                                {item?.description && (
                                                    <Typography variant="body2" color={'textSecondary'} mb={1}>
                                                        {item?.description}
                                                    </Typography>
                                                )}
                                                {item?.type === 'text' ? (
                                                    <TextField
                                                        disabled={candidateOnboarding?.status === 'completed'}
                                                        name={`responses[${index}].response`}
                                                        onChange={handleChange}
                                                        value={item.response ?? ''}
                                                        required
                                                        sx={{ flexGrow: 1 }}
                                                        fullWidth
                                                        hiddenLabel
                                                    />
                                                ) : item?.type === 'file' ? (
                                                    <Stack>
                                                        <FileUpload
                                                            onUploadCompleted={(fileKey) => {
                                                                //TODO: display uploaded file after upload
                                                                //FIXME: the files should only be uploaded once the form is submitted
                                                                setFieldValue(`responses[${index}].response`, fileKey);
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
                                        disabled={candidateOnboarding?.status === 'completed'}
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
