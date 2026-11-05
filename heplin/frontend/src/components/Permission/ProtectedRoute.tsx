import React from 'react'
import { usePermission } from 'src/hooks/usePermission'
import { useAuth } from 'src/providers';
import { Permission } from './component';

function ProtectedRoute({ children, permission }: { children: React.ReactNode, permission: string }) {
    const { user } = useAuth();

    const userPermission = user?.permissions?.find((userPermission: any) => userPermission?.scope === permission && userPermission?.allowed === true)
    const isPermission = userPermission ? true : false;

    return isPermission ? <>{children}</> : <Permission />
}

export default ProtectedRoute