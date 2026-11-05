import {
  Alert,
  Avatar,
  Chip,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { SeverityPill, SeverityPillColor } from 'src/components/severity-pill';
import { Add } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useGetAllTenantsQuery, useChangeTenantStatusMutation } from 'src/hooks/useServices';
import { array, convertPublicFileURL } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/providers';
import { SetStateAction, useMemo, useState } from 'react';
import { ConfirmAction, CustomButton, Paginate } from 'src/components/shared';
import { enqueueSnackbar } from 'notistack';
import { RouterLink } from 'src/components/router-link';
import { AddCircleIcon, UnavailableIcon } from 'hugeicons-react';

type TenantStatus = 'active' | 'pending' | 'inactive';

type TenantStatusColor = { [key in TenantStatus]: SeverityPillColor };

const tenantStatusColorMapper: TenantStatusColor = {
  active: 'primary',
  pending: 'info',
  inactive: 'warning',
};

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Unpaid', value: 'unpaid' },
];

export function Component() {
  const { t } = useTranslation();
  const { activeTenantId } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams();
  const changeStatusMutation = useChangeTenantStatusMutation()
  const { activeTenant } = useAuth()
  const [activeTab, setActiveTab] = useState('all');

  const pageSizes = [12, 24, 48];
  const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
  const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]
  const query = useMemo(() => `page=${page + 1}&limit=${limit}&status=${activeTab}`, [page, limit, activeTab])

  const tenantsQuery = useGetAllTenantsQuery(query)
  const tenants = array<any>(tenantsQuery.data?.results);


  const handleTabChange = (event: any, newValue: SetStateAction<string>) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <div className='pr-[55px]'>
        <div className='flex justify-between mb-[30px]'>
          <p className='text-2xl font-medium'>{t('tenants')}</p>
          <CustomButton
            LinkComponent={RouterLink}
            href={"create"}
            startIcon={<Add />}
          >
            {t('createNewCompany')}
          </CustomButton>
        </div>
        <Tabs
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          value={activeTab}
          sx={{
            "& .Mui-selected": { color: "#E31E24!important", },
            "& .MuiTabs-indicator": { backgroundColor: "#E31E24" },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={t(tab.label)}
              value={tab.value}
              sx={{ color: "#141B34", }}
            />
          ))}
        </Tabs>
        <div
          className='py-[22px] rounded-[13px] mt-[20px] '
          style={{
            boxShadow: "0px 4px 14.8px 0px #A6A6A640"
          }}
        >
          {
            tenantsQuery.isError ? (
              <Alert severity="error">{(tenantsQuery?.error as any)?.message}</Alert>
            ) : !tenantsQuery.isLoading && tenants.length === 0 ? (
              <Alert severity="info">{t('thereAreNoTenants')}</Alert>
            ) : (
              <Paginate
                isFetching={tenantsQuery.isFetching || tenantsQuery.isPreviousData}
                pageSizes={pageSizes}
                count={tenantsQuery?.data?.count}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& .MuiTableCell-root": {
                          fontSize: "14px",
                          fontWeight: "500",
                          fontFamily: "Satoshi, sans-serif",
                          textTransform: "capitalize",
                        }
                      }}
                    >
                      <TableCell>{t('companyName')}</TableCell>
                      <TableCell>{t('location')}</TableCell>
                      <TableCell align='center'>{t('companySize')}</TableCell>
                      {/* <TableCell align='center'>{t('plan')}</TableCell> */}
                      <TableCell align='center' width={200}>{t('subscribedSince')}</TableCell>
                      <TableCell align='center' width={150}>{t('currentStatus')}</TableCell>
                      <TableCell align='right' width={200}>{t('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow
                        sx={{
                          backgroundColor:
                            tenant?._id === activeTenant?._id ?
                              'ButtonFace' :
                              'inherit',
                          "& .MuiTableCell-root": {
                            fontSize: "14px",
                            fontWeight: "500",
                            fontFamily: "Satoshi, sans-serif",
                            textTransform: "capitalize",
                            cursor: "pointer",
                          }
                        }}
                        key={tenant._id}
                      >
                        <TableCell>
                          <div className='flex gap-2 items-center'>
                            <Avatar
                              src={convertPublicFileURL(tenant?.logo)}
                              variant='square'
                              sx={{
                                width: 40,
                                height: 40,
                                p: "4px",
                                backgroundColor: "transparent",
                                border: tenant?._id === activeTenant?._id ?
                                  '1px solid lightGray' :
                                  '1px solid #EFEFEF'
                              }}
                            >
                              {!tenant?.logo && tenant?.name[0] + tenant?.name[1]}
                            </Avatar>
                            <RouterLink href={`${tenant?._id}/edit`}>
                              <p className='font-medium'>
                                {tenant?.name} {tenant?._id === activeTenant?._id ? "Active" : null}
                              </p>
                            </RouterLink>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {
                              [tenant.country, tenant.city]
                                .filter(Boolean)
                                .map(i => i?.[0]?.toUpperCase() + i?.slice(1)?.toLowerCase())
                                .join(' · ')
                            }
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant="body2">{tenant.companySize}</Typography>
                        </TableCell>
                        {/* <TableCell align='center'>
                          <Chip
                            label={tenant?.plan ?? "Basic"}
                            size="small"
                          />
                        </TableCell> */}
                        <TableCell align='center'>
                          <Typography variant="body2">
                            {new Date(tenant.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <SeverityPill
                            color={tenantStatusColorMapper[tenant.status as TenantStatus || 'pending']}
                          >
                            {t(tenant.status || 'pending')}
                          </SeverityPill>
                        </TableCell>
                        <TableCell align='right'>
                          {(tenant.status === 'pending' || tenant.status === 'inactive') &&
                            <ConfirmAction
                              title='Changed Status'
                              description='Are you sure you want to change the status in tenants?'
                              onConfirm={async () => {
                                await changeStatusMutation.mutateAsync(
                                  { tenantId: activeTenant._id, selectedTenantId: tenant?._id, payload: { status: "active" } },
                                  {
                                    onSuccess: (data) => {
                                      tenantsQuery.refetch()
                                      enqueueSnackbar(t('tenant_status_changed'), { variant: 'success' })
                                    },
                                    onError: (error: any) => {

                                      enqueueSnackbar(t(error?.message), { variant: 'error' })
                                    }
                                  }
                                )
                              }}
                            >
                              <Tooltip title={t("markAsActive")}>
                                <IconButton>
                                  <AddCircleIcon />
                                </IconButton>
                              </Tooltip>
                            </ConfirmAction>
                          }
                          {(tenant.status === 'active' || tenant.status === 'pending') &&
                            <ConfirmAction
                              title='Changed Status'
                              description='Are you sure you want to change the status in tenants?'
                              onConfirm={async () => {
                                await changeStatusMutation.mutateAsync(
                                  { tenantId: activeTenant._id, selectedTenantId: tenant?._id, payload: { status: "inactive" } },
                                  {
                                    onSuccess: (data) => {
                                      tenantsQuery.refetch()
                                      enqueueSnackbar(t('tenant_status_changed'), { variant: 'success' })
                                    },
                                    onError: (error: any) => {

                                      enqueueSnackbar(error?.message, { variant: 'error' })
                                    }
                                  }
                                )
                              }}
                            >
                              <Tooltip title={t("setToPassive")}>
                                <IconButton>
                                  <UnavailableIcon size={18} />
                                </IconButton>
                              </Tooltip>
                            </ConfirmAction>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paginate>
            )
          }
        </div>
      </div>
    </>
  );
}

Component.displayName = 'TenantsList';
