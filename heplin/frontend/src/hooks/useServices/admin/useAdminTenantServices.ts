import { useQuery } from "@tanstack/react-query";
import { getAllEmployeesOfTenant } from "src/services/admin";

export function useGetAllEmployeesOfTenant({ tenantId }: { tenantId: string }) {
    return useQuery(
        ["employees-of-tenant-by-tenantId", tenantId],
        () => getAllEmployeesOfTenant(tenantId),
        { enabled: !!tenantId }
    )
}