import { Box, Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useRouter } from 'src/hooks/use-router';
import { useArchiveNewJobMutation, useGetPostingChannelsOfUser, usePostNewJobMutation } from 'src/hooks/useServices';
import { jobValidationSchema } from 'src/validations';
import { useParams } from 'react-router';
import { useAuth } from 'src/providers';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { useTenantQuotaQuery } from 'src/hooks/useServices/useQuotaService';
import { ContentForm, FormDefinitions, GeneralForm, LocationForm, PageHeader } from '../../Jobs/CreateJob/sections';
import ArchiveGeneralForm from '../CreateArchiveJob/GeneralForm';
import ArchivePageHeader from '../CreateArchiveJob/PageHeader';
import { archiveJobValidationSchema } from 'src/validations/archiveJobForm';

const initialValues = {
    title: '',
    categoryId: '',
    jobType: '',
    locationType: '',
    country: {
        names: {
            en: '',
            tr: '',
        },
    },
    city: '',
    district: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    fields: [
        { type: 'name_surname', isRequired: true, isVisible: true },
        { type: 'email', isRequired: true, isVisible: true },
        { type: 'phone', isRequired: true, isVisible: true },
        { type: 'cv', isRequired: true, isVisible: true },
        {
            type: 'coverLetter',
            isRequired: false,
            isVisible: true,
        },
        {
            type: 'currentCompany',
            isRequired: false,
            isVisible: true,
        },
    ],
    tenantId: '',
};

export const CreateArchiveJobPage = () => {
    const postNewJobMutation = useArchiveNewJobMutation();
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const { t } = useTranslation()
    return (
        <Box
            component="main"
            flexGrow={1}
        >
            <Container maxWidth="xl">
                <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => {


                        return postNewJobMutation.mutateAsync(
                            {
                                ...values,
                                seoTitle: values.title,
                                seoDescription: values.title,
                            },
                            {
                                onSuccess: (data) => {
                                    enqueueSnackbar(t('Created new job as draft'), { variant: 'success' });

                                },
                                onError: (err: any) => {
                                    enqueueSnackbar(t(((err.response.data as any).message)), { variant: 'error' });
                                },
                            }
                        );
                    }
                    }
                    validationSchema={archiveJobValidationSchema}
                >
                    {({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <Stack
                                spacing={3}
                                sx={{ mb: 3 }}
                            >

                                <ArchivePageHeader />
                                <ArchiveGeneralForm />
                                <ContentForm />
                                <LocationForm />
                            </Stack>
                        </form>
                    )}
                </Formik>
            </Container>
        </Box>
    );
};

CreateArchiveJobPage.displayName = 'CreateArchiveJobPage';
