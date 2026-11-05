import { useQuery, useMutation } from '@tanstack/react-query';
import {
    bulkActionMailService,
    deleteMailService,
    downloadMailAttachmentService,
    getAllMailsOfCandidateService,
    getAllMailsService,
    getMailDetailService,
    postNewMailService,
    sendMailAnotherJobMutation,
} from 'src/services';

export function useGetAllMailsQuery({ query, enabled }: { query?: string, enabled?: boolean }) {
    return useQuery(['mails', query], () => getAllMailsService({ query }), {
        keepPreviousData: true,
        enabled: typeof enabled === 'boolean' ? !!enabled : true,
    });
}

export function useGetAllMailsOfCandidateQuery({ query, enabled, refetch }: { query?: string, enabled?: boolean, refetch?: boolean }) {
    return useQuery(['mails', query, refetch], () => getAllMailsOfCandidateService({ query }), {
        keepPreviousData: true,
        enabled: typeof enabled === 'boolean' ? !!enabled : true,
    });
}

export function useGetMailDetailQuery({ id }: { id: string }) {
    return useQuery(['mails', id], () => getMailDetailService({ id }), {
        enabled: !!id,
    });
}

export function usePostNewMailMutation() {
    return useMutation(postNewMailService);
}

export function useSendMailAnotherJobMutation() {
    return useMutation(sendMailAnotherJobMutation);
}

export function useDeleteMailMutation() {
    return useMutation(deleteMailService);
}

export function useBulkMailActionMutation() {
    return useMutation(bulkActionMailService)
}

export function useMailAttachmentMutation() {
    return useMutation(downloadMailAttachmentService)
}