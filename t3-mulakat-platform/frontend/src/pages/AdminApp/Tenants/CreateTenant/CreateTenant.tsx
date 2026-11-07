import { Box, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { TenantPayload } from 'src/types';
import { useSnackbar } from 'notistack';
import { useRouter } from 'src/hooks/use-router';
import { useCreateTenantServiceMutation } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';
import { ChannelConfigurationForm, ContactInformation, GeneralForm, LogoForm, PageHeader, ParentTenantForm } from '../sections/Form';

export function Component() {
    const { activeTenantId } = useAuth()
    const initialValues: TenantPayload = {
        name: "",
        legalName: "",
        address: "",
        email: "",
        phone: "",
        logo: "",
        subdomain: "",
        website: "",
        customDomain: "",
        description: "",
        isActive: true,
        isDeleted: false,
        parentTenantId: activeTenantId,
        contacts: [],
        country: "TR",
        city: "",
        hasCareerPage: false
    };
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const createTenantMutation = useCreateTenantServiceMutation()

    return (
        <Box
            component="main"
            flexGrow={1}
        >
            <Container maxWidth="xl">
                <Formik
                    initialValues={initialValues}
                    onSubmit={(values, helpers) => {
                        createTenantMutation.mutate(
                            values,
                            {
                                onSuccess: (data) => {
                                    enqueueSnackbar('Created new company.', { variant: 'success' });
                                    router.push(`/tenants`);
                                },
                                onError: (err) => {
                                    enqueueSnackbar((err as any).message, { variant: 'error' });
                                },
                                onSettled: () => {
                                    helpers.setSubmitting(false);
                                }
                            }
                        )
                    }}
                >
                    {({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <Stack
                                spacing={3}
                                sx={{ mb: 3 }}
                            >
                                <PageHeader />
                                <GeneralForm />
                                <LogoForm />
                                <ContactInformation />
                                <ParentTenantForm />
                                <ChannelConfigurationForm />
                            </Stack>
                        </form>
                    )}
                </Formik>
            </Container>
        </Box>
    );
}

Component.displayName = 'CreateCandidate';
