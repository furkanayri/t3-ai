import { apiClient } from "src/libs"
import { TenantCategories } from "src/types/TenantCategories";

export async function getAllCategoriesService(query: any) {
    const res = await apiClient.get(`/v1/categories?${query ?? ""}`)
    return res.data
}

export async function getJobsByCategoryService(categoryId: string, query: any) {
    const res = await apiClient.get(`/v1/categories/${categoryId}/jobs?${query ?? ""}`);
    return res.data;
}

export async function postNewTenantCategoriesService({ payload }: { payload: TenantCategories }) {
    const res = await apiClient.post(`/v1/tenantCategories`, payload);
    return res.data
}
