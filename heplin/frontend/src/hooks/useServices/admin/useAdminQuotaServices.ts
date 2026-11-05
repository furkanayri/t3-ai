import { useMutation, useQuery } from "@tanstack/react-query";
import { getTenantQuotaForAdmin, updateTenantQuotaForAdmin } from "src/services/admin/adminQuotaServices";
import { enabled } from "store";

export function useAdminTenantQuotaQuery(tenantId: string) {
    return useQuery(['adminTenant-quota'], () => getTenantQuotaForAdmin(tenantId), { enabled: !!tenantId });
}
export function useAdminTenantMutation() {
    return useMutation(updateTenantQuotaForAdmin)
}