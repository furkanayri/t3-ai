import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteCategoriesService, getAllCategoriesService, postNewCategoriesService, postNewTenantCategoriesService, updateCategoriesService, getJobsByCategoryService } from 'src/services';

export function useGetAllCategoriesQuery(query: any) {
    return useQuery(['categories', query], () => getAllCategoriesService(query), {
        keepPreviousData: true
    });
}

export function useGetJobsByCategoryQuery(categoryId: string, query: any) {
    return useQuery(['jobs', categoryId], () => getJobsByCategoryService(categoryId, query), {
        keepPreviousData: true
    });
}

export function usePostNewCategoriesMutation() {
    return useMutation(postNewCategoriesService);
}

export function useDeleteCategoriesMutation() {
    return useMutation(deleteCategoriesService);
}

export function useUpdateCategoriesMutation() {
    return useMutation(updateCategoriesService);
}

export function usePostNewTenantCategoriesMutation() {
    return useMutation(postNewTenantCategoriesService);
}
