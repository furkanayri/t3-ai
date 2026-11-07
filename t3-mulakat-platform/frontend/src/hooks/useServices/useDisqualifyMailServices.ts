import { useMutation, useQuery } from '@tanstack/react-query';

import { createDisqualifyEmailTemplate, deleteDisqualifyEmailTemplate, getDisqualifyTenantMail, updateDisqualifyEmailTemplate } from 'src/services/disqualifyMailTemplateServices';



export function useGetDisqualifyEmailTemplatesQuery(query?: string) {
    return useQuery(['disqualify-email-templates', query], () => getDisqualifyTenantMail(query));
}


export function usePostDisqualifyEmailTemplateMutation() {
    return useMutation(createDisqualifyEmailTemplate);
}
export function useUpdateDisqualifyEmailTemplateMutation() {
    return useMutation(updateDisqualifyEmailTemplate);
}

export function useDeleteDisqualifyEmailTemplateMutation() {
    return useMutation(deleteDisqualifyEmailTemplate)
}

