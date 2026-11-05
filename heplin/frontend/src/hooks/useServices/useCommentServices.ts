import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createCommentService,
  deleteCommentService,
  getAllCandidateCommentsService,
} from 'src/services';

export function useGetAllCandidateCommentsQuery({ candidateId }: { candidateId: string }) {
  return useQuery(
    ['candidateComments', candidateId],
    () => getAllCandidateCommentsService({ candidateId }),
    {
      enabled: !!candidateId,
    }
  );
}

export function useCreateCandidateCommentMutation() {
  return useMutation(createCommentService);
}

export function useDeleteCandidateCommentMutation() {
  return useMutation(deleteCommentService);
}
