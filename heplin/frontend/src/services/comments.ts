import { tenantApiClient } from 'src/libs/apiClient';

export async function getAllCandidateCommentsService({ candidateId }: { candidateId: string }) {
  const res = await tenantApiClient.get(`/candidates/${candidateId}/comments`);

  return res.data
}

export async function createCommentService(payload: { content: string; candidateId: string }) {
  const res = await tenantApiClient.post(`/candidates/${payload.candidateId}/comments`, { content: payload.content });

  return res.data
}

export async function deleteCommentService({ id, candidateId }: { id: string, candidateId: string }) {
  const res = await tenantApiClient.delete(`/candidates/${candidateId}/comments/${id}`,);

  return res.data
}
