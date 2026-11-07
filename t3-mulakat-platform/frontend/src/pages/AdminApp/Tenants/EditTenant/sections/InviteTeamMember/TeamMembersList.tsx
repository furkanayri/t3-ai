import { Block, Replay } from '@mui/icons-material';
import {
    Avatar,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { UnavailableIcon } from 'hugeicons-react';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmAction } from 'src/components/shared';
import { useResendInviteTenantMemberMutation, useRevokeTenantMemberMutation } from 'src/hooks/useServices';

const userStatus = (
    data: string
): {
    color: 'default' | 'error' | 'warning' | 'info';
    label: string;
} => {
    switch (data) {
        case 'active':
            return {
                color: 'default',
                label: 'Active',
            };
        case 'inactive':
            return {
                color: 'error',
                label: 'Inactive',
            };
        case 'pending':
            return {
                color: 'warning',
                label: 'Pending',
            };
        default:
            return {
                color: 'info',
                label: 'Unknown',
            };
    }
};

export default function TeamMembersList({ data, refetch, isLoading }: { data: any[], refetch: any, isLoading: boolean }) {
    const { t } = useTranslation()


    const inviteResend = useResendInviteTenantMemberMutation()
    const rovekeInvite = useRevokeTenantMemberMutation()

    if (isLoading) return <CircularProgress />

    return (
        <Scrollbar>
            <Table sx={{ minWidth: 400 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Member</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell
                            sx={{ maxWidth: 300 }}
                            align="right"
                        >
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((member, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <Avatar
                                        src={member?.avatar}
                                        sx={{
                                            height: 40,
                                            width: 40,
                                        }}
                                    >
                                        {member?.userId?.email?.charAt(0)?.toUpperCase()}
                                        {member?.userId?.email?.charAt(1)?.toUpperCase()}
                                    </Avatar>
                                    <div>
                                        <Typography variant="subtitle2">
                                            {member?.userId?.name} {member?.userId?.surname}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            {member?.userId?.email}
                                        </Typography>
                                    </div>
                                </Stack>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    color={userStatus(member?.userId?.status).color}
                                    label={userStatus(member?.userId?.status).label}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell
                                align="right"
                            >
                                <Stack
                                    direction="row"
                                    justifyContent={'flex-end'}
                                >
                                    {member?.userId?.status === 'pending' && (

                                        <ConfirmAction
                                            title={t('Resendinvitation')}
                                            description={t('are_you_sure_resend_invitation')}
                                            onConfirm={async () => {
                                                try {
                                                    await inviteResend.mutateAsync({
                                                        email: member?.userId?.email,
                                                        tenantId: member?.tenantId
                                                    })
                                                    enqueueSnackbar(t('invitation_sent'), { variant: 'success' })
                                                    return refetch()
                                                } catch (error) {
                                                    enqueueSnackbar(t("An error occured while resending invitation email"), { variant: 'error' })

                                                }
                                            }}
                                        >
                                            <Button
                                                size="small"
                                                color="inherit"
                                                sx={{ color: 'text.secondary' }}
                                                startIcon={<Replay fontSize="small" />}
                                            >
                                                Resend
                                            </Button>
                                        </ConfirmAction>


                                    )}
                                    <ConfirmAction
                                        title={t("Revoke invitation")}
                                        description={t('are_you_sure_revoke_invitation')}
                                        onConfirm={async () => {
                                            try {
                                                await rovekeInvite.mutateAsync({ tenantMemberId: member.userId._id, tenantId: member.tenantId })
                                                enqueueSnackbar(t('invitation_revoked'), { variant: 'success' })
                                                return refetch()
                                            } catch (error) {
                                                throw error
                                            }
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            startIcon={<UnavailableIcon size={18} />}
                                            sx={{ color: '#FD5F5F' }}
                                        >
                                            {t("revoke")}
                                        </Button>
                                    </ConfirmAction>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Scrollbar>
    );
}
