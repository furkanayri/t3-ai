import apiClient, { tenantApiClient } from "src/libs/apiClient";
import { CandidateOnboardingPayload } from "src/types/CandidateOnboarding";

export async function getOneCandidateOnboardingService({ id }: { id: string }) {
    const res = await tenantApiClient.get(`/candidate-onboardings/${id}`);

    return res.data;
}

export async function createCandidateOnboardingService({ payload }: { payload: CandidateOnboardingPayload }) {
    const res = await tenantApiClient.post('/candidate-onboardings', payload);

    return res.data;
}
export async function updateMyCandidateOnboardingService({ id, payload, query }: { id: string, payload: CandidateOnboardingPayload, query?: string }) {
    const res = await apiClient.patch(`/v1/candidate/onboard/${id}${query ? '?' + query : ''}`, payload);

    return res.data;
}

export async function getMyCandidateOnboardingDetailService({ id }: { id: string }) {
    const res = await apiClient.get(`/v1/candidate/onboard/${id}`);

    return res.data;
}