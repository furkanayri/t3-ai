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
import { PERMISSION_GROUPS } from 'src/constants';
import {
    useGetTenantUsersOfPermissionQuery,
    useUpdateUserPermissions,
} from 'src/hooks/useServices';
import debounce from 'lodash.debounce';
import { array } from 'src/utils';
import { enqueueSnackbar } from 'notistack';
import { useSearchParams } from 'react-router-dom';

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

export default function ManageUserPermissionsAdmin({ onClose, }: { onClose: () => void; }) {
    const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});
    const [searchParams, setSearchParams] = useSearchParams()

    const tenantId = useMemo(() => searchParams.get('tenantId'), [searchParams])
    const memberId = useMemo(() => searchParams.get('memberId'), [searchParams])
    const dialog = useMemo(() => searchParams.get('dialog'), [searchParams])

    const isOpen = !!tenantId && !!memberId && dialog === 'permissions'

    const permissionsQuery = useGetTenantUsersOfPermissionQuery({
        memberId: memberId!,
        tenantId: tenantId!,
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
            memberId: memberId!,
            tenantId: tenantId!,
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
                {t('managePermissionsTitle')}
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
                                    {value.map((permission) => {
                                        const hasPermission = permissions[permission] ?? false;
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
