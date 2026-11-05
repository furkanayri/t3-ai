import { apiClient } from 'src/libs';
import { tenantApiClient } from 'src/libs/apiClient';

export async function getAllCandidateCvFiles({ candidateId }: { candidateId: string }) {
  const res = await tenantApiClient.get(`/candidates/${candidateId}/cv`)

  return res.data
}

export async function getMyCvFiles() {
  const res = await apiClient.get("/v1/candidate/myCVs");

  return res.data
}

export async function readFileService({ fileKey }: { fileKey: string }) {
  const res = await apiClient.get("/v1/upload/readFile/" + fileKey, {
    responseType: 'blob',
  });

  return res.data
}

export async function getCVFileService({ id }: { id: string }) {
  const res = await apiClient.get("/v1/upload/cv/" + id, {
    responseType: 'blob',
  });

  return res.data
}

export async function updateCVService({
  id,
  payload,
}: {
  id: string;
  payload: { title: string };
}) {
  const res = await apiClient.patch(`/v1/candidate/cv/${id}`, payload);

  return res.data
}

export async function publicUploadFileService(payload: any) {
  const res = await apiClient.post("/v1/upload/public", payload);

  return res.data
}
export async function publicUploadTenantCompanyService(payload: any) {
  const res = await apiClient.post("/v1/upload/public/tenantLogoForCompany", payload);

  return res.data
}

export async function privateFileUploadService(payload: any) {
  const res = await apiClient.post("/v1/upload/private", payload);

  return res.data
}

export async function cvUploadFileService({ payload }: { payload: any }) {
  const res = await apiClient.post("/v1/upload/cv", payload);

  return res.data
}
export async function certificateUploadFileService(payload: any) {
  const res = await apiClient.post("/v1/upload/certificate", payload);

  return res.data
}

export async function deleteCVFileService({ id }: { id: string }) {
  const res = await apiClient.delete(`/v1/candidate/cv/${id}`);

  return res.data
}
