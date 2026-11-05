import {
    Alert,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmAction } from 'src/components/shared';
import { useResendInviteTenantMemberMutation, useRevokeTenantMemberMutation, useChangeTeamMemberStatusMutation } from 'src/hooks/useServices';
import ManageUserPermissions from './ManageUserPermissions';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/providers';
import { PERMISSION_SCOPES } from 'src/constants';
import { Exchange01Icon, Settings02Icon, Tick02Icon, UnavailableIcon, UserBlock01Icon, Delete01Icon, UserIcon } from 'hugeicons-react';
import { useDeleteTeamMember } from 'src/hooks/useServices/useUserServices';
const userStatus = (
    data: string
): {
    color: '#0FB900' | 'default' | '#FD5FB2' | '#F3A815' | 'black';
    label: string;
} => {
    switch (data) {
        case 'active':
            return {
                color: '#0FB900',
                label: 'active',
            };
        case 'inactive':
            return {
                color: '#FD5FB2',
                label: 'inactive',
            };
        case 'pending':
            return {
                color: '#F3A815',
                label: 'pending',
            };
        default:
            return {
                color: 'black',
                label: 'unknown',
            };
    }
};


export default function TeamMembersList({ data, refetch, isLoading }: { data: any[], refetch: any, isLoading: boolean }) {
    const { user } = useAuth()

    const inviteResend = useResendInviteTenantMemberMutation()
    const rovekeInvite = useRevokeTenantMemberMutation()
    const changeStatusMutation = useChangeTeamMemberStatusMutation()
    const deleteMember = useDeleteTeamMember()
    const [activeMemberId, setActiveMemberId] = useState("")
    const { t } = useTranslation()

    const activeUser = useMemo(() => {
        return data.find((member) => member?._id === activeMemberId)?.userId
    }, [data, activeMemberId])

    const hasPermissionListAccess = useMemo(() => {
        const listPermission = user?.permissions
            ?.find((permission: any) => permission.scope === PERMISSION_SCOPES.list_permissions)
        return listPermission?.allowed === true
    }, [user?.permissions])
    const isManagerOrOwner = user.employee?.type === 'manager' || user.employee?.type === 'owner';

    if (isLoading) return <CircularProgress />

    return (
        <>
            <ManageUserPermissions memberId={activeMemberId} isOpen={!!activeMemberId} onClose={() => setActiveMemberId("")} user={activeUser} />

            <Scrollbar>
                <Table sx={{ minWidth: 400 }}>
                    <TableHead>
                        <TableRow sx={{
                            "& .MuiTableCell-root": {
                                backgroundColor: 'transparent'
                            }

                        }}>
                            <TableCell sx={{ textTransform: 'capitalize  !important' }}>
                                <p className='text-sm font-medium'>
                                    {t("teamMember")}
                                </p>
                            </TableCell>
                            <TableCell sx={{ textTransform: 'capitalize  !important' }}>
                                <p className='text-sm font-medium'>
                                    {t('email')}
                                </p>
                            </TableCell>
                            <TableCell sx={{ textTransform: 'capitalize  !important' }}>
                                <p className='text-sm font-medium'>
                                    {t("status")}
                                </p>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {data?.length === 0 ?
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <Alert severity='info'>{t('noTeamMembers')}</Alert>
                                </TableCell>
                            </TableRow> :
                            data?.map((member, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className='flex gap-4 items-center'>

                                            <UserIcon
                                                color='#E31E24' size={13}
                                            />
                                            <div>
                                                <p className='font-medium text-sm text-[#141B34]'>
                                                    {member?.userId?.name + " " + member?.userId?.surname}
                                                </p>
                                                {!member?.name && !member?.surname && member?.status === 'pending' && (
                                                    <p className='font-medium text-sm text-[#141B34]'>
                                                        *{t("notRegistered")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className='font-medium text-xs text-[#979797]'>{member?.userId?.email}</p>
                                    </TableCell>
                                    <TableCell>
                                        <p style={{ color: userStatus(member?.userId?.status).color }}>
                                            {t(userStatus(member?.userId?.status).label)}
                                        </p>
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                    >
                                        <Stack
                                            direction="row"
                                            justifyContent={'flex-end'}
                                            spacing={1}
                                        >
                                            {member?.status === 'pending' && (<ConfirmAction
                                                title={t('Revoke invitation')}
                                                description={t('are_you_sure_revoke_invitation')}
                                                onConfirm={async () => {
                                                    try {
                                                        await rovekeInvite.mutateAsync({ tenantMemberId: member.userId._id, tenantId: member.tenantId })
                                                        enqueueSnackbar(t('Invitation revoked'), { variant: 'success' })
                                                        return refetch()
                                                    } catch (error) {
                                                        throw error
                                                    }
                                                }}
                                            >
                                                <Tooltip title={t("revoke")}>
                                                    <IconButton disabled={!isManagerOrOwner} size="small" color="error">
                                                        <UnavailableIcon color={(!isManagerOrOwner) ? '#A6A6A6' : '#141B34'} size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </ConfirmAction>)}
                                            {member?.status === 'pending' && (
                                                <ConfirmAction
                                                    title={t("Resend invitation")}
                                                    description={t("Are you sure you want to resend the invitation?")}
                                                    onConfirm={async () => {
                                                        try {
                                                            await inviteResend.mutateAsync({
                                                                email: member?.userId?.email,
                                                                tenantId: member?.tenantId
                                                            })
                                                            enqueueSnackbar(t('Invitation sent'), { variant: 'success' })
                                                            return refetch()
                                                        } catch (error) {
                                                            throw error
                                                        }
                                                    }}
                                                >
                                                    <Tooltip title={t("Resend")}>
                                                        <IconButton disabled={!isManagerOrOwner} size="small" color="inherit" sx={{ color: 'text.secondary' }}>
                                                            <Exchange01Icon color={(!isManagerOrOwner) ? '#A6A6A6' : '#141B34'} size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ConfirmAction>
                                            )}
                                            {member?.userId?.status === 'inactive' &&
                                                <ConfirmAction
                                                    title={t('change_status')}
                                                    description={t('are_you_sure_change_status_user')}
                                                    onConfirm={async () => {
                                                        await changeStatusMutation.mutateAsync({ tenantId: member?.tenantId, memberId: member?._id, payload: { status: "active", userId: member?.userId?._id } },
                                                            {
                                                                onSuccess: (data) => {
                                                                    enqueueSnackbar(t('employee_status_changed'), { variant: 'success' })
                                                                    return refetch()
                                                                },
                                                                onError: (error: any) => {
                                                                    enqueueSnackbar(t(error?.message), { variant: 'error' })
                                                                }
                                                            }
                                                        )
                                                    }}
                                                >
                                                    <Tooltip title={t("active")}>
                                                        <IconButton>
                                                            <Tick02Icon color='#141B34' size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ConfirmAction>
                                            }
                                            {/* {member?.status === 'pending' &&
                                                <ConfirmAction
                                                    title={t('change_status')}
                                                    description={t('are_you_sure_change_status_user')}
                                                    onConfirm={async () => {
                                                        await changeStatusMutation.mutateAsync({ tenantId: member?.tenantId, memberId: member?._id, payload: { status: "active", userId: member?.userId?._id } },
                                                            {
                                                                onSuccess: (data) => {
                                                                    enqueueSnackbar(t('tenant_status_changed'), { variant: 'success' })
                                                                    return refetch()
                                                                },
                                                                onError: (error: any) => {
                                                                    enqueueSnackbar(t(error?.message), { variant: 'error' })
                                                                }
                                                            }
                                                        )
                                                    }}
                                                >
                                                    <Tooltip title={t("active")}>
                                                        <IconButton>
                                                            <Tick02Icon color='#141B34' size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ConfirmAction>
                                            } */}
                                            {member?.userId?.status === 'active' &&
                                                <ConfirmAction
                                                    title={t('change_status')}
                                                    description={t('are_you_sure_change_status_user')}
                                                    onConfirm={async () => {
                                                        await changeStatusMutation.mutateAsync({ tenantId: member?.tenantId, memberId: member?._id, payload: { status: "inactive", userId: member?.userId?._id } },
                                                            {
                                                                onSuccess: (data) => {
                                                                    enqueueSnackbar(t('employee_status_changed'), { variant: 'success' })
                                                                    return refetch()
                                                                },
                                                                onError: (error: any) => {
                                                                    enqueueSnackbar(t(error?.message), { variant: 'error' })
                                                                }
                                                            }
                                                        )
                                                    }}

                                                >
                                                    <Tooltip title={t("setToPassive")}>
                                                        <IconButton disabled={!isManagerOrOwner}>
                                                            <UserBlock01Icon color={(!isManagerOrOwner) ? '#A6A6A6' : '#141B34'} size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ConfirmAction>
                                            }

                                            {member?.status === 'active' &&
                                                <Tooltip title={t("permissions")}>
                                                    <IconButton
                                                        size="small"
                                                        color="inherit"
                                                        sx={{ color: 'text.secondary' }}
                                                        onClick={() => setActiveMemberId(member?._id)}
                                                        disabled={!hasPermissionListAccess || member?.status !== 'active' || !isManagerOrOwner}
                                                    >
                                                        <Settings02Icon color={(!isManagerOrOwner) ? '#A6A6A6' : '#141B34'} size={16} />
                                                    </IconButton>
                                                </Tooltip>}
                                            <ConfirmAction
                                                title={t('delete_member')}
                                                description={t('are_you_sure_delete_member')}
                                                onConfirm={async () => {
                                                    await deleteMember.mutateAsync({ userId: member?.userId?._id },
                                                        {
                                                            onSuccess: (data) => {
                                                                enqueueSnackbar(t('user_deleted'), { variant: 'success' })
                                                                return refetch()
                                                            },
                                                            onError: (error: any) => {
                                                                enqueueSnackbar(t(error?.message), { variant: 'error' })
                                                            }
                                                        }
                                                    )
                                                }}
                                            >
                                                <Tooltip title={t("delete_member")}>
                                                    <IconButton disabled={!isManagerOrOwner}>
                                                        <Delete01Icon color={(!isManagerOrOwner) ? '#A6A6A6' : '#141B34'} size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </ConfirmAction>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Scrollbar>
        </>

    );
}
