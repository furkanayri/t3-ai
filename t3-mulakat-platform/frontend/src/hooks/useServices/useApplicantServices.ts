import { useQuery } from "@tanstack/react-query";
import { getApplicantDetailService } from "src/services/applicantServices";

export function useApplicantQuery(jobId: string, candidateId: string) {
    return useQuery(['applicant-detail', jobId, candidateId], () => getApplicantDetailService({ jobId, candidateId }), { enabled: !!jobId && !!candidateId });
}