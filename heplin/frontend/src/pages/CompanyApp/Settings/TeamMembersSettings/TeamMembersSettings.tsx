import {
    Autocomplete,
    CircularProgress,
    TextField,
} from '@mui/material';
import TeamMembersList from './TeamMembersList';
import { useFormik } from 'formik';
import { useGetTenantMembersQuery, useInviteTenantMemberMutation } from 'src/hooks/useServices';
import * as yup from 'yup';
import { array } from 'src/utils';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import InvitationResult from './InvitationResult';
import { useAuth } from 'src/providers';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { CustomButton, Paginate } from 'src/components/shared';
import { ProtectedRoute } from 'src/components/Permission';


export default function Component() {
    const { activeTenantId } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams()
    const { t } = useTranslation();

    const schema = yup.object().shape({
        email: yup.string().email(t('emailInvalid')).required(t('emailRequired')),
    });
    const pageSizes = [6, 12, 25]
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])

    const status = useMemo(() => searchParams.get('status'), [searchParams]) ?? ''
    const tenantMembersQuery = useGetTenantMembersQuery({
        tenantId: activeTenantId?.toString() ?? '',
        query: query + (status ? `&status=${status}` : '')
    });

    const inviteTenantMember = useInviteTenantMemberMutation();
    const [invitationResult, setInvitationResults] = useState({ isOpen: false, email: '' });

    const { values, setFieldValue, errors, handleSubmit, touched, setFieldTouched, isSubmitting } =
        useFormik({
            initialValues: {
                email: "",
            },
            validationSchema: schema,
            onSubmit: (values, helpers) => {
                if (!activeTenantId) return;

                inviteTenantMember.mutate(
                    { email: values.email, tenantId: activeTenantId?.toString() },
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
                            const errorMessage = t(error?.response?.data?.message);
                            enqueueSnackbar(errorMessage, {
                                variant: 'error',
                                autoHideDuration: 3000,
                            });

                        },
                        onSettled: () => {
                            helpers.setSubmitting(false);
                        },
                    }
                );
            },
        });
    const handleStatusChange = (event: any, newValue: string) => {
        setSearchParams((prev: any) => {
            prev.set('status', newValue)
            return prev
        })
    };

    const tenantMembers = array<any>(tenantMembersQuery?.data?.results);

    return (
        <ProtectedRoute permission='manage_members'>
            <div className='pt-12 w-full max-w-4xl'>
                <form onSubmit={handleSubmit}>
                    <InvitationResult
                        isOpen={invitationResult.isOpen}
                        email={invitationResult.email}
                        onClose={() =>
                            setInvitationResults({
                                email: '',
                                isOpen: false,
                            })
                        }
                    />
                    <p className="text-[20px] text-[#5E5E5E] font-medium mb-5">{t('Team Members')}</p>
                    <div className='p-7' style={{
                        boxShadow: '0px 4px 14.8px 0px #A6A6A640'
                    }}>
                        <div className='flex justify-between mb-10'>
                            <div className='flex justify-center gap-2'>
                                <TextField
                                    sx={{ width: '300px' }}
                                    error={touched.email && !!errors.email}
                                    helperText={touched.email && errors.email ? t(errors.email) : false}
                                    label={t('email')}
                                    name="email"
                                    size='small'
                                    fullWidth
                                    onChange={(event: any) => setFieldValue('email', event.target.value)}
                                    value={values.email}
                                    onBlur={() => setFieldTouched('email', true)}
                                />
                                <CustomButton
                                    type="submit"
                                    sx={{
                                        width: '120px',
                                        height: '37px',
                                        p: 2
                                    }}>

                                    {isSubmitting ? <CircularProgress
                                        size={20}
                                        sx={{
                                            color: 'white',
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '-10px',
                                            marginLeft: '-10px',
                                        }}
                                    /> : t('sendInvite')}
                                </CustomButton>
                            </div>
                            <div>
                                <Autocomplete
                                    id="status"
                                    options={["active", "pending", "passive", "frozen", "deleted"]}
                                    renderInput={(params) => <TextField
                                        {...params}
                                        sx={{ width: '200px' }}
                                        size='small'
                                        placeholder={t("status")}
                                    />}
                                    getOptionLabel={option => t(option)}
                                    onChange={(event, newValue: string | null) => handleStatusChange(event, newValue || '')}
                                />
                            </div>
                        </div>
                        <Paginate
                            count={tenantMembersQuery.data?.count}
                            isFetching={tenantMembersQuery?.isFetching || tenantMembersQuery?.isPreviousData}
                            pageSizes={pageSizes}
                        >
                            <TeamMembersList
                                data={tenantMembers}
                                refetch={tenantMembersQuery.refetch}
                                isLoading={tenantMembersQuery.isFetching}

                            />
                        </Paginate>
                    </div>
                </form>

            </div>

        </ProtectedRoute >

    );
}

Component.displayName = 'InviteTeamMember';
