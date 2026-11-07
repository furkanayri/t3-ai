import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
    Skeleton as MuiSkeleton,
    Stack,
    Typography,
} from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSION_GROUPS, PERMISSION_SCOPES } from 'src/constants';
import {
    useGetTenantUsersOfPermissionQuery,
    useUpdateUserPermissions,
} from 'src/hooks/useServices';
import { useAuth } from 'src/providers';
import debounce from 'lodash.debounce';
import { array } from 'src/utils';
import { enqueueSnackbar } from 'notistack';

function Skeleton({ isLoading, children }: { isLoading: boolean; children: ReactNode }) {
    if (isLoading) return <MuiSkeleton>{children}</MuiSkeleton>;

    return children;
}

const toPermissionObject = (permissions: any): { [key: string]: boolean } => {
    return array<any>(permissions).reduce((acc, permission) => {
        acc[permission.scope] = permission.allowed;
        return acc;
    }, {});
};

interface IProptypes {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    memberId: string;
}

export default function ManageUserPermissions({ isOpen, onClose, user, memberId, }: IProptypes) {
    const { user: activeUser } = useAuth()
    const hasPermissionManageAccess = useMemo(() => {
        const listPermission = activeUser?.permissions
            ?.find((permission: any) => permission.scope === PERMISSION_SCOPES.manage_permissions)
        return listPermission?.allowed === true
    }, [activeUser])
    const hasAssignPermissionManageAccess = useMemo(() => {
        const listPermission = activeUser?.permissions
            ?.find((permission: any) => permission.scope === PERMISSION_SCOPES.assign_permission_manage_access)
        return listPermission?.allowed === true
    }, [activeUser])


    const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});
    const { activeTenantId } = useAuth();
    const permissionsQuery = useGetTenantUsersOfPermissionQuery({
        memberId,
        tenantId: activeTenantId?.toString() ?? '',
        onSuccess: (res) => {
            setPermissions(toPermissionObject(res?.results));
        },
    });
    const { t } = useTranslation();
    const updatePermissionsMutation = useUpdateUserPermissions({
        onSuccess: () => {
            permissionsQuery.refetch();
            enqueueSnackbar(t('Permissions updated'), { variant: 'success' });
        },
        onError: (error) => {
            enqueueSnackbar(error?.message, { variant: 'error' });
        },
    });

    const handleUpdatePermissionsDebounced = useCallback(
        debounce(updatePermissionsMutation.mutate, 1000),
        []
    );

    const handleUpdatePermissions = (scope: string, allowed: boolean) => {
        const copyPermissions = { ...permissions };
        copyPermissions[scope] = allowed;
        setPermissions(copyPermissions);
        handleUpdatePermissionsDebounced({
            memberId,
            tenantId: activeTenantId?.toString() ?? '',
            permissions: Object.entries(copyPermissions).map(([scope, allowed]) => ({
                scope,
                allowed,
            })),
        });
    };

    const handleClose = () => {
        setPermissions({});
        onClose();
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogTitle>
                {t('managePermissionsTitle', {
                    name: user?.name && user?.surname ? `${user?.name} ${user?.surname}` : user?.email,
                })}
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ minWidth: 500 }}>
                <Stack
                    display={'grid'}
                    gridTemplateColumns={'repeat(2, 1fr)'}
                    gap={4}
                >
                    {Object.entries(PERMISSION_GROUPS).map(([key, value]) => {
                        return (
                            <Stack
                                key={key}
                                spacing={1}
                            >
                                <Typography variant="subtitle1">{t(key)}</Typography>
                                <FormGroup>
                                    {value
                                        .filter(p => p !== "access_admin_panel")
                                        .map((permission) => {
                                            console.log(permission, '333333333333333333333333333333333333333333333333');

                                            const hasPermission = permissions[permission] ?? false;
                                            console.log(hasPermission, '22222222222222222222222222222222222222222');

                                            // const isPermissionRelated = [
                                            //     PERMISSION_SCOPES.list_permissions,
                                            //     PERMISSION_SCOPES.manage_permissions,
                                            //     PERMISSION_SCOPES.assign_permission_manage_access,
                                            // ].includes(permission)

                                            // if (isPermissionRelated)

                                            return (
                                                <Skeleton
                                                    key={permission}
                                                    isLoading={
                                                        permissionsQuery.isFetching || updatePermissionsMutation.isLoading
                                                    }
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={hasPermission}
                                                                onChange={(e) => {
                                                                    handleUpdatePermissions(permission, e.target.checked);
                                                                }}
                                                                disabled={!hasPermissionManageAccess || (!hasAssignPermissionManageAccess)}
                                                            />
                                                        }
                                                        label={t(permission)}
                                                    />
                                                </Skeleton>
                                            );
                                        })}
                                </FormGroup>
                            </Stack>
                        );
                    })}
                </Stack>
                <DialogActions>
                    <Stack spacing={2}>
                        <Button onClick={handleClose}>
                            {t("close")}
                        </Button>
                    </Stack>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}
