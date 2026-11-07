import { useMutation, useQuery } from '@tanstack/react-query';
import { createEmailTemplate, deleteEmailTemplate, getAllEmailTemplates, getEmailTemplate, updateEmailTemplate } from 'src/services';

export function useGetAllEmailTemplatesQuery(query?: string) {
    return useQuery(['email-templates', query], () => getAllEmailTemplates(query));
}

export function useGetOneEmailTemplateQuery(id: string) {
    return useQuery(["email-templates-detail"], () => getEmailTemplate(id));
}

export function usePostEmailTemplateMutation() {
    return useMutation(createEmailTemplate);
}
export function useDeleteEmailTemplateMutation() {
    return useMutation(deleteEmailTemplate);
}

export function useUpdateEmailTemplateMutation() {
    return useMutation(updateEmailTemplate)
}

