import { apiClient } from 'src/libs/apiClient';
import { Categories } from 'src/types/Categories';

export async function postNewCategoriesService({ adminTenantId, payload }: { adminTenantId: string, payload: Categories }) {
    const res = await apiClient.post(`/v1/admin/${adminTenantId}/categories`, payload);
    return res.data
}

export async function updateCategoriesService({ adminTenantId, id, payload }: { adminTenantId: string, id: string; payload: any }) {
    const res = await apiClient.patch(`/v1/admin/${adminTenantId}/categories/${id}`, payload);
    return res.data;
}

export async function deleteCategoriesService({ id, adminTenantId }: { id: string, adminTenantId: string }) {
    const res = await apiClient.delete(`/v1/admin/${adminTenantId}/categories/${id}`);
    return res.data;
}

