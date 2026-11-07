import { ArrowBack } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { FormikHelpers } from 'formik';
import { enqueueSnackbar } from 'notistack';
import { createContext, useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { RouterLink } from 'src/components/router-link';
import { useGetTenantInfoQuery, useUpdateTenantInfoMutation } from 'src/hooks/useServices';
import { TenantPayload } from 'src/types';
import { GeneralInfo, InviteTeamMember } from './sections';
import { convertPublicFileURL } from 'src/utils';
import EditQuota from './sections/Quota';
import { useTranslation } from 'react-i18next';

type TenantContextValues = {
    tenant?: any;
    isLoading: boolean;
    isFetching: boolean;
    onUpdateTenant?: OnUpdateTenantFunc;
};

const TenantContext = createContext<TenantContextValues>({
    isLoading: false,
    isFetching: false,
});

export type OnUpdateTenantFunc = (
    values: TenantPayload,
    helpers: FormikHelpers<TenantPayload>
) => void;

export const useTenantContext = () => {
    const context = useContext(TenantContext);

    if (!context) {
        throw new Error('useTenantContext must be used within a TenantContextProvider');
    }
    return context;
};

export function Component() {
    const { tenantId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation()

    const activeTab = searchParams.get('tab') || 'general' || 'quota';
    const updateTenantMutation = useUpdateTenantInfoMutation();
    const tenantInfoQuery = useGetTenantInfoQuery({ tenantId: tenantId?.toString() ?? '' });

    const tenant = tenantInfoQuery.data?.tenant
    const onUpdateTenant = (values: TenantPayload, helpers: FormikHelpers<TenantPayload>) => {
        if (!tenantId) return;

        updateTenantMutation.mutate(
            {
                id: tenantId?.toString() ?? '',
                payload: values,
            },
            {
                onSuccess: (data) => {
                    enqueueSnackbar(t('Updated the company.'), { variant: 'success' });
                    tenantInfoQuery.refetch();
                },
                onError: (err) => {
                    enqueueSnackbar((err as any).message, { variant: 'error' });
                },
                onSettled: () => {
                    helpers.setSubmitting(false);
                },
            }
        );
    };

    return (
        <TenantContext.Provider
            value={{
                tenant,
                isLoading: tenantInfoQuery.isLoading,
                isFetching: tenantInfoQuery.isFetching,
                onUpdateTenant,
            }}
        >
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8,
                }}
            >
                <Container maxWidth="xl">
                    {tenantInfoQuery.isLoading ? <CircularProgress /> : <Stack spacing={4}>
                        <Stack spacing={4}>
                            <div>
                                <Link
                                    color="text.primary"
                                    component={RouterLink}
                                    href={'/tenants'}
                                    sx={{
                                        alignItems: 'center',
                                        display: 'inline-flex',
                                    }}
                                    underline="hover"
                                >
                                    <SvgIcon sx={{ mr: 1 }}>
                                        <ArrowBack />
                                    </SvgIcon>
                                    <Typography variant="subtitle2">Companies</Typography>
                                </Link>
                            </div>
                            <Stack
                                alignItems="flex-start"
                                direction={{
                                    xs: 'column',
                                    md: 'row',
                                }}
                                justifyContent="space-between"
                                spacing={4}
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                >
                                    <Avatar
                                        src={convertPublicFileURL(tenant?.logo)}
                                        sx={{
                                            height: 64,
                                            width: 64,
                                        }}
                                    >
                                        {tenant?.name?.charAt(0)}
                                    </Avatar>
                                    <Stack spacing={1}>
                                        <Typography variant="h4">
                                            {tenant?.name}
                                        </Typography>
                                        <div>
                                            <Chip
                                                label={`${tenant?.subdomain}.heplin.com`}
                                                size="small"
                                            />
                                        </div>
                                    </Stack>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                ></Stack>
                            </Stack>
                            <div>
                                <Tabs
                                    indicatorColor="primary"
                                    onChange={(e, val) => {
                                        setSearchParams({ tab: val });
                                    }}
                                    scrollButtons="auto"
                                    sx={{ mt: 3 }}
                                    textColor="primary"
                                    value={activeTab}
                                    variant="scrollable"
                                >
                                    {[
                                        { label: 'Company', value: 'general' },
                                        { label: 'Invite Member', value: 'invite-member' },
                                        { label: 'Quota', value: 'quota' },
                                    ].map((tab) => (
                                        <Tab
                                            key={tab.value}
                                            label={tab.label}
                                            value={tab.value}
                                        />
                                    ))}
                                </Tabs>
                                <Divider />
                            </div>
                        </Stack>
                        {activeTab === 'general' && (
                            <div>
                                <GeneralInfo />
                            </div>
                        )}
                        {activeTab === 'invite-member' && (
                            <div>
                                <InviteTeamMember />
                            </div>
                        )}
                        {activeTab === 'quota' && (
                            <div>
                                <EditQuota />
                            </div>
                        )}

                    </Stack>}
                </Container>
            </Box>
        </TenantContext.Provider>
    );
}

Component.displayName = 'EditTenant';
