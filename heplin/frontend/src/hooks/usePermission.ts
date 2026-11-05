import { useAuth } from "src/providers";

export function usePermission(scope: string) {
    const { user } = useAuth();
    const isAllowed = user?.permissions?.find((permission: any) => permission?.scope === scope && permission?.allowed === true)

    return isAllowed ? true : false;
}