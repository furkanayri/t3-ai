import { useQuery } from "@tanstack/react-query";
import { getTenantQuota } from "src/services/quota";

export function useTenantQuotaQuery() {
    return useQuery(['tenant-quota'], () => getTenantQuota(), { refetchOnWindowFocus: true });
}