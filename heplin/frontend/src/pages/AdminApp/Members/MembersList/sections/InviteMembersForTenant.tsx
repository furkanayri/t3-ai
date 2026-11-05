import {
    Autocomplete,
    Card,
    CardContent,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useGetTenantMembersQuery, useInviteTenantMemberMutation } from 'src/hooks/useServices';
import * as yup from 'yup';
import { array } from 'src/utils';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';

export default function InviteMembersForTenant({ selectedTenantId }: { selectedTenantId: string }) {
    const tenantMembersQuery = useGetTenantMembersQuery({
        tenantId: selectedTenantId?.toString() ?? '',
    });
    const inviteTenantMember = useInviteTenantMemberMutation();
    const [invitationResult, setInvitationResults] = useState({ isOpen: false, email: '' });
    const { t } = useTranslation();

    const schema = yup.object().shape({
        email: yup.string().email(t('emailInvalid')).required(t('emailRequired')),
    });

    const { values, setFieldValue, errors, handleSubmit, touched, setFieldTouched, isSubmitting } =
        useFormik({
            initialValues: {
                email: "",
            },
            validationSchema: schema,
            onSubmit: (values, helpers) => {
                if (!selectedTenantId) return;

                inviteTenantMember.mutate(
                    { email: values.email, tenantId: selectedTenantId?.toString() },
                    {
                        onSuccess: (res) => {
                            helpers.resetForm();
                            setInvitationResults({
                                isOpen: res?.isSendRegistrationMail === true,
                                email: res?.email
                            });
                            tenantMembersQuery.refetch();
                        },
                        onError: (error: any) => {
                            enqueueSnackbar(error?.message, { variant: 'error' });

                        },
                        onSettled: () => {
                            helpers.setSubmitting(false);
                        },
                    }
                );
            },
        });

    const tenantMembers = array<any>(tenantMembersQuery.data?.results);

    return (

        <Card sx={{ my: 1 }}>
            <CardContent>
                <Grid
                    container
                    spacing={3}
                    component={'form'}
                    onSubmit={handleSubmit}
                >
                    <Grid
                        xs={12}
                        md={5}
                        item
                    >
                        <Stack spacing={1}>
                            <Typography variant="h6">{t('inviteTeamMembers')}</Typography>
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                {/* You currently pay for 2 Editor Seats. */}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid
                        xs={12}
                        md={7}
                        item
                    >
                        <Stack
                            spacing={3}
                            direction={'row'}
                            alignItems="flex-start"
                        >
                            <TextField
                                error={touched.email && !!errors.email}
                                helperText={touched.email && errors.email ? t(errors.email) : false}
                                label={t('email')}
                                name="email"
                                fullWidth
                                onChange={(event) => setFieldValue('email', event.target.value)}
                                sx={{
                                    flex: 2,
                                }}
                                value={values.email}
                                onBlur={() => setFieldTouched('email', true)}
                            />
                            <LoadingButton
                                loading={isSubmitting}
                                type="submit"
                                // size="large"
                                sx={{}}
                                variant="contained"
                            >
                                {t('sendInvite')}
                            </LoadingButton>
                        </Stack>
                    </Grid>
                </Grid>


            </CardContent>
        </Card>

    );
}

InviteMembersForTenant.displayName = 'InviteTeamMember';
