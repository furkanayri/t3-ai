import { useQuery } from "@tanstack/react-query";
import { getAllPostingChannelsService, getOnePostingChannelService, getPostingChannelByTenantIdService } from "src/services/admin";

export function useGetAllPostingChannels({ adminTenantId, query }: { adminTenantId: string, query?: string }) {
    return useQuery(["posting-channels", query], () => getAllPostingChannelsService({ adminTenantId, query }), {
        enabled: !!adminTenantId
    })
}
export function useGetPostingChannelByTenantId({ tenantId }: { tenantId: string }) {
    return useQuery(["posting-channels-by-tenantId", tenantId], () => getPostingChannelByTenantIdService({ tenantId }), {
        enabled: !!tenantId
    })
}
export function useGetOnePostingChannel({ adminTenantId, id, enabled }: { adminTenantId: string, id: string, enabled: boolean }) {
    return useQuery(['posting-channels-detail', id], () => getOnePostingChannelService({ adminTenantId, id }), { enabled });
}
