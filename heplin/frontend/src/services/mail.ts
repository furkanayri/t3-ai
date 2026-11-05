import { tenantApiClient } from 'src/libs/apiClient';
const basePath = '/mails';

export async function getAllMailsService({ query }: { query?: string }) {
  const res = await tenantApiClient.get(`${basePath}?${query || ""}`);

  return res.data;
}

export async function getAllMailsOfCandidateService({ query }: { query?: string }) {
  const res = await tenantApiClient.get(`/candidate-mails?${query || ""}`);

  return res.data;
}

export async function getMailDetailService({ id }: { id: string }) {
  const res = await tenantApiClient.get(`${basePath}/${id}`);
  return res.data
}

export async function postNewMailService(payload: any) {
  const res = await tenantApiClient.post(basePath, payload);

  return res.data;
}


export async function sendMailAnotherJobMutation(payload: any) {
  const res = await tenantApiClient.post("/mailAnotherJob", payload);
  return res.data;

}

export async function bulkActionMailService(payload: any) {
  const res = await tenantApiClient.post(`${basePath}/action`, payload);

  return res.data;
}

export async function deleteMailService({ id }: { id: string }) {
  const res = await tenantApiClient.delete(`${basePath}/${id}`);

  return res.data;
}

export async function downloadMailAttachmentService({ id, fileKey }: { id: string; fileKey: string }) {
  const res = await tenantApiClient.get(`${basePath}/${id}/attachments?filekey=${fileKey}`, {
    responseType: 'blob',
  })

  return res.data;
}