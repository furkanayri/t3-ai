import { apiClient } from "src/libs";
import { adminApiClient } from "src/libs/apiClient";

export async function getAllPostingChannelsService({ adminTenantId, query }: { adminTenantId: string, query?: string }) {
    const res = await apiClient.get(`/v1/admin/${adminTenantId}/postingChannels?${query || ""}`)

    return res.data
}
export async function getPostingChannelByTenantIdService({ tenantId }: { tenantId: string }) {
    const res = await adminApiClient.get(`/tenants/${tenantId}/postingChannels`)

    return res.data
}

export async function getOnePostingChannelService({ adminTenantId, id }: { adminTenantId: string, id: string }) {
    const res = await apiClient.get(`/v1/admin/${adminTenantId}/postingChannels/${id}`);

    return res.data;
}