import apiClient, { tenantApiClient } from 'src/libs/apiClient'
import { Meeting } from 'src/types'

export async function getAllMeetingsService(payload: any) {
    const res = await tenantApiClient.get(`/meetings${payload?.query ?? ""}`)

    return res.data;
}

export async function getMeetingDetailService({ id }: { id: string }) {
    const res = await tenantApiClient.get(`/meetings/${id}`)

    return res.data;
}

export async function postNewMeetingService(payload: Meeting) {
    const res = await tenantApiClient.post(`/meetings`, payload)

    return res.data;
}

export async function updateMeetingService({ id, payload }: { id: string; payload: Meeting }) {
    const res = await tenantApiClient.patch(`/meetings/${id}`, payload)

    return res.data;
}

export async function deleteMeetingService({ id }: { id: string }) {
    const res = await tenantApiClient.delete(`/meetings/${id}`)

    return res.data;
}

export async function getMyMeetings() {
    const res = await apiClient.get(`/v1/candidate/my-meetings`)

    return res.data;
}
export async function postMeetingSignatureService(meetingNumber: number, role: number) {
    const res = await apiClient.post(`/v1/meeting`, {
        meetingNumber,
        role,
    });
    return res.data;
}