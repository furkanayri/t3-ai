import { useQuery } from "@tanstack/react-query";
import { getAllCandidatesService, getCandidateByIdService } from "src/services/admin";

export function useGetAllCandidates(query?: string) {
    return useQuery(
        ["admin-candidates", query],
        () => getAllCandidatesService({ query }),
    )
}
export function useGetCandidateById(candidateId: string) {
    return useQuery(["admin-candidate-detail", candidateId], () => getCandidateByIdService({ candidateId }),)
}