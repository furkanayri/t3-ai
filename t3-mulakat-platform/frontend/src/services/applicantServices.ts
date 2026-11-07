// board kısmında aday bilgisi çeken genel bir applicant servisi yoktu.

import { tenantApiClient } from "src/libs/apiClient"


export async function getApplicantDetailService({ jobId, candidateId }: { jobId: string, candidateId: string }) {
    const res = await tenantApiClient.get(`/applicants/${jobId}/candidate/${candidateId}`)
    return res.data
}