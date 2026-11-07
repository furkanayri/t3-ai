import { Box, Stack } from '@mui/material';
import { Formik } from 'formik';
import React from 'react';
import { TenantPayload } from 'src/types/Tenant';
import { ChannelConfigurationForm, ContactInformation, GeneralForm, LogoForm, PageHeader } from '../sections/Form';
import { enqueueSnackbar } from 'notistack';
import { useCreateTenantServiceCompanyMutation } from 'src/hooks/useServices';
import UserInfo from '../sections/Form/UserInfo';
import { useNavigate } from 'react-router-dom';
import InformationCompanyPage from '../sections/Form/InformationCompanyPage';
import { useTranslation } from 'react-i18next';

const CompanyRegister = () => {
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
        parentTenantId: "",
        contacts: [],
        country: "TR",
        city: "",
        hasCareerPage: true
    };

    const createTenantMutation = useCreateTenantServiceCompanyMutation();
    const navigate = useNavigate();
    const { t } = useTranslation()

    return (
        <Box
            sx={{
                height: '75vh',
                overflowY: 'auto',
                padding: 1,
            }}
        >
            <Formik
                initialValues={initialValues}
                onSubmit={(values, helpers) => {
                    createTenantMutation.mutate(
                        values,
                        {
                            onSuccess: (data: any) => {
                                enqueueSnackbar(t('Created new company.'), { variant: 'success' });
                                navigate('/login');
                            },
                            onError: (err: any) => {
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
                            <GeneralForm />
                            <LogoForm />
                            <ContactInformation />
                            <UserInfo />
                            <InformationCompanyPage />
                            <PageHeader />
                        </Stack>
                    </form>
                )}
            </Formik>
        </Box>
    );
};

export default CompanyRegister;
