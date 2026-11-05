import {
    Alert,
    Avatar,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetTenantMembersQuery } from 'src/hooks/useServices';
import { array, convertPublicFileURL } from 'src/utils';
import { useAuth } from 'src/providers';
import { ConfirmAction, IdInfoIcon, Paginate } from 'src/components/shared';
import { enqueueSnackbar } from 'notistack';
import { useMemo } from 'react';
import InviteMembersForTenant from './InviteMembersForTenant';
import ManageUserPermissionsAdmin from './ManageUserPermissionsAdmin';
import { userStatus } from '../util';
import { Exchange01Icon, Settings01Icon, UnavailableIcon, UserAdd01Icon, UserRemove01Icon } from 'hugeicons-react';
import { useRouter } from 'src/hooks/use-router';

export default function CompanyTab({ state }: { state: any }) {
    const { t } = useTranslation();
    const router = useRouter()
    const [searchParams, setSearchParams] = useSearchParams();
    const pageSizes = [12, 25, 50]
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])
    const { activeTenantId } = useAuth();
    const tenantMembersQuery = useGetTenantMembersQuery({ query, tenantId: activeTenantId ?? '' });
    const tenantMembers = array<any>(tenantMembersQuery.data?.results);

    const handleClickMemberSettings = (memberId: string) => {
        setSearchParams(prev => {
            prev.set('memberId', memberId)
            prev.set('dialog', 'permissions')
            return prev
        })
    }
    const handleEditUser = (id: string) => {
        router.push(`/users/${id}/edit`)
    }

    return (
        <>
            <ManageUserPermissionsAdmin
                onClose={() => {
                    setSearchParams((prev) => {
                        prev.delete('memberId')
                        prev.delete('dialog')
                        return prev
                    })
                }}
            />
            <div
                className='py-[22px] rounded-[13px] mt-[20px] '
                style={{
                    boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                }}
            >
                {
                    tenantMembersQuery.isError ? (
                        <Alert severity="error">{(tenantMembersQuery?.error as any)?.message}</Alert>
                    ) : !tenantMembersQuery.isLoading && tenantMembers.length === 0 ? (
                        <Alert severity="info">{t('noTeamMembers')}</Alert>
                    ) : (
                        <Paginate
                            isFetching={tenantMembersQuery.isFetching || tenantMembersQuery.isPreviousData}
                            pageSizes={pageSizes}
                            count={tenantMembersQuery?.data?.count}
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
                                        <TableCell width={80} align='center'>#</TableCell>
                                        <TableCell width={300}>{t("fullName")}</TableCell>
                                        <TableCell width={300} align='center'>{t('createdDate')}</TableCell>
                                        <TableCell width={300} align='center'>{t('memberStatus')}</TableCell>
                                        <TableCell width={300} align='right'>{t('actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tenantMembers?.map((tenantmember: any) => (
                                        <TableRow
                                            key={tenantmember._id}
                                            sx={{
                                                "& .MuiTableCell-root": {
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    fontFamily: "Satoshi, sans-serif",
                                                    textTransform: "capitalize",
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <IdInfoIcon id={tenantmember?._id} />
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-3 group cursor-pointer'>
                                                    <Avatar
                                                        src={convertPublicFileURL(tenantmember?.userId?.avatar)}
                                                        sx={{
                                                            textTransform: "uppercase",
                                                            width: 35,
                                                            height: 35
                                                        }}
                                                    >
                                                        {
                                                            tenantmember?.userId?.name && tenantmember?.userId?.surname ?
                                                                tenantmember?.userId?.name?.[0] + tenantmember?.userId?.surname?.[0]
                                                                : null
                                                        }
                                                    </Avatar>
                                                    <div>
                                                        <p onClick={() => handleEditUser(tenantmember?.userId?._id)} className='group-hover:underline'>
                                                            {tenantmember?.userId?.name + " " + tenantmember?.userId?.surname}
                                                        </p>
                                                        {!tenantmember?.name && !tenantmember?.surname && tenantmember?.status === 'pending' && (
                                                            <p>*{t("notRegistered")}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell align='center'>
                                                <p>
                                                    {new Date(tenantmember?.createdAt)?.toLocaleDateString()}
                                                </p>
                                            </TableCell>
                                            <TableCell align='center'>
                                                <Chip
                                                    color={userStatus(tenantmember?.status)?.color}
                                                    label={t(userStatus(tenantmember?.status)?.label)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align='right'>
                                                <div className='flex items-center gap-2 cursor-pointer justify-end'>
                                                    {tenantmember?.userId.status === 'pending' && (
                                                        <ConfirmAction
                                                            title={t('Revoke invitation')}
                                                            description={t('are_you_sure_revoke_invitation')}
                                                            onConfirm={async () => {
                                                                try {
                                                                    await state.rovekeInvite.mutateAsync({ tenantMemberId: tenantmember?._id, tenantId: tenantmember.tenantId })
                                                                    enqueueSnackbar(t('invitation_revoked'), { variant: 'success' })
                                                                    return tenantMembersQuery.refetch()
                                                                } catch (error) {
                                                                    enqueueSnackbar("An error occured while revoking invitation", { variant: 'error' })

                                                                }
                                                            }}
                                                        >
                                                            <Tooltip title={t("Revoke invitation")}>
                                                                <p className='p-[8px]'>
                                                                    <UnavailableIcon size={18} color="#FD5F5F" />
                                                                </p>
                                                            </Tooltip>
                                                        </ConfirmAction>
                                                    )}
                                                    {tenantmember?.userId.status === 'pending' && (
                                                        <ConfirmAction
                                                            title={t('Resendinvitation')}
                                                            description={t('are_you_sure_resend_invitation')}
                                                            onConfirm={async () => {
                                                                try {
                                                                    await state.inviteResend.mutateAsync({
                                                                        email: tenantmember?.userId?.email,
                                                                        tenantId: tenantmember?.tenantId
                                                                    })
                                                                    enqueueSnackbar(t('invitation_sent'), { variant: 'success' })
                                                                    return tenantMembersQuery.refetch()
                                                                } catch (error) {
                                                                    enqueueSnackbar("An error occured while resending invitation email", { variant: 'error' })

                                                                }
                                                            }}
                                                        >
                                                            <Tooltip title={t("resendInvitation")}>
                                                                <p className='p-[8px]'>
                                                                    <Exchange01Icon color='#141B34' size={16} />
                                                                </p>
                                                            </Tooltip>
                                                        </ConfirmAction>
                                                    )}
                                                    {tenantmember?.status === 'active' && (
                                                        <ConfirmAction
                                                            title={t('change_status')}
                                                            description={t('are_you_sure_change_status_user')}
                                                            onConfirm={async () => {
                                                                try {
                                                                    await state.changeStatusMutation.mutateAsync({ memberId: tenantmember?._id, tenantId: tenantmember.tenantId, payload: { status: "inactive", userId: tenantmember?.userId?._id } })
                                                                    enqueueSnackbar(t('user_status_changed'), { variant: 'success' })
                                                                    tenantMembersQuery.refetch()
                                                                } catch (error) {
                                                                    enqueueSnackbar("An error occured while changing user status", { variant: 'error' })

                                                                }
                                                            }}
                                                        >
                                                            <Tooltip title={t("MarkasPassive")}>
                                                                <p className='p-[8px]'>
                                                                    <UserRemove01Icon size={18} />
                                                                </p>
                                                            </Tooltip>
                                                        </ConfirmAction>
                                                    )}
                                                    {tenantmember?.status === 'pending' && (
                                                        <ConfirmAction
                                                            title='changed status'
                                                            description={t('are_you_sure_change_status_user')}
                                                            onConfirm={async () => {
                                                                try {
                                                                    await state.changeStatusMutation.mutateAsync({ memberId: tenantmember?._id, tenantId: tenantmember.tenantId, payload: { status: "active", userId: tenantmember?.userId?._id } })
                                                                    enqueueSnackbar(t('user_status_changed'), { variant: 'success' })
                                                                    tenantMembersQuery.refetch()
                                                                } catch (error) {
                                                                    enqueueSnackbar("An error occured while changing user status", { variant: 'error' })

                                                                }
                                                            }}
                                                        >
                                                            <Tooltip title={t("markAsActive")}>
                                                                <p className='p-[8px]'>
                                                                    <UserAdd01Icon size={18} />
                                                                </p>
                                                            </Tooltip>
                                                        </ConfirmAction>
                                                    )}
                                                    {tenantmember?.status === 'inactive' &&
                                                        <ConfirmAction
                                                            title='changed status'
                                                            description='Are you sure you want to change the status in user?'
                                                            onConfirm={async () => {
                                                                try {
                                                                    await state.changeStatusMutation.mutateAsync({ memberId: tenantmember?._id, tenantId: tenantmember.tenantId, payload: { status: "active", userId: tenantmember?.userId?._id } })
                                                                    enqueueSnackbar(t('user_status_changed'), { variant: 'success' })
                                                                    tenantMembersQuery.refetch()
                                                                } catch (error) {
                                                                    enqueueSnackbar("An error occured while changing user status", { variant: 'error' })

                                                                }
                                                            }}
                                                        >
                                                            <Tooltip title={t("markAsActive")}>
                                                                <p className='p-[8px]'>
                                                                    <UserAdd01Icon size={18} />
                                                                </p>
                                                            </Tooltip>
                                                        </ConfirmAction>
                                                    }
                                                    <Tooltip title={t("managePermissions")}>
                                                        <IconButton
                                                            size="small"
                                                            color="inherit"
                                                            onClick={() => {
                                                                const tenantIdParam = searchParams.get('tenantId')
                                                                if (!tenantIdParam) {
                                                                    setSearchParams(prev => {
                                                                        prev.set('tenantId', activeTenantId ?? "")
                                                                        return prev
                                                                    })
                                                                }
                                                                handleClickMemberSettings(tenantmember?._id)
                                                            }}
                                                            disabled={tenantmember?.status !== "active"}
                                                        >
                                                            <Settings01Icon size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paginate>
                    )
                }
            </div>
            {activeTenantId && <InviteMembersForTenant selectedTenantId={activeTenantId} />}
        </>
    );
}
