import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import TeamMembersList from './TeamMembersList';
import { useFormik } from 'formik';
import { useGetTenantMembersQuery, useInviteTenantMemberMutation } from 'src/hooks/useServices';
import { useParams } from 'react-router';
import * as yup from 'yup';
import { array } from 'src/utils';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import InvitationResult from './InvitationResult';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';

export default function Component() {
    const { tenantId } = useParams();
    const tenantMembersQuery = useGetTenantMembersQuery({ tenantId: tenantId?.toString() ?? '' });
    const inviteTenantMember = useInviteTenantMemberMutation();
    const [invitationResults, setInvitationResults] = useState<any[]>([]);
    const { t } = useTranslation()

    const schema = yup.object().shape({
        email: yup.string().email(t('emailInvalid')).required(t('emailRequired')),
    });

    const { values, setFieldValue, errors, handleSubmit, touched, setFieldTouched, isSubmitting } =
        useFormik({
            initialValues: {
                email: '',
            },
            validationSchema: schema,
            onSubmit: (values, helpers) => {
                if (!tenantId) return;

                inviteTenantMember.mutate(
                    { email: values.email, tenantId: tenantId?.toString() },
                    {
                        onSuccess: (res) => {
                            helpers.resetForm();
                            setInvitationResults(array<any>(res?.results));
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
        <>
            <InvitationResult
                results={invitationResults}
                onClose={() => setInvitationResults([])}
            />
            <Card>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                        component={'form'}
                        onSubmit={handleSubmit}
                    >
                        <Grid
                            xs={12}
                            md={4}
                            item
                        >
                            <Stack spacing={1}>
                                <Typography variant="h6">Invite members</Typography>
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
                            md={8}
                            item
                        >
                            <Stack
                                spacing={3}
                                direction={'row'}
                                alignItems="flex-start"
                            >

                                <TextField
                                    error={touched.email && !!errors.email}
                                    helperText={
                                        touched.email && errors.email
                                    }
                                    label="Email"
                                    name="email"
                                    value={values.email}
                                    onChange={(e) => {
                                        setFieldValue(
                                            'email',
                                            e.target.value
                                        );
                                    }}
                                    fullWidth
                                    onBlur={() => setFieldTouched('email', true)}
                                />
                                <LoadingButton
                                    loading={isSubmitting}
                                    type="submit"
                                    size="large"
                                    sx={{ minWidth: 150, minHeight: 57 }}
                                    variant="contained"
                                >
                                    Send Invite
                                </LoadingButton>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 3,
                        }}
                    >
                        Current members
                    </Typography>
                    <TeamMembersList
                        data={tenantMembers}
                        refetch={tenantMembersQuery.refetch}
                        isLoading={tenantMembersQuery.isFetching}
                    />
                </CardContent>
            </Card>
        </>
    );
}

Component.displayName = 'InviteTeamMember';
