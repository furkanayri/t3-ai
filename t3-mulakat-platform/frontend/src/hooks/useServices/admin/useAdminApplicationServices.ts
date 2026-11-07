import { useQuery } from "@tanstack/react-query"
import { getAllJobApplicationsService } from "src/services/admin"


export function useAdminGetAllApplicationsQuery(query?: string) {
    return useQuery(
        ["admin-applications", query],
        () => getAllJobApplicationsService(query),
    )
}

