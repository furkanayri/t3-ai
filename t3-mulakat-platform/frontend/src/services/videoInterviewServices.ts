import apiClient, { tenantApiClient } from "src/libs/apiClient"

export async function getVideoInterview({ jobId }: { jobId: string }) {
    const res = await tenantApiClient.get(`/jobs/${jobId}/getInterviewAudio`)
    return res.data
}
export async function updateVideoInterview({ jobId, payload }: { jobId: string, payload: any }) {
    const res = await tenantApiClient.patch(`/jobs/${jobId}/interviewAudio`, payload)
    return res.data
}


// evaluate değişti
// export async function videoInterviewEvaluation({ interviewId, candidateAnswersId }: { interviewId: string, candidateAnswersId: string }) {
//     const res = await tenantApiClient.patch(`/interview/${interviewId}/candidateAnswers/${candidateAnswersId}/videoInterviewEvaluation`)
//     return res.data
// }


export async function videoInterviewInvitation({ jobId, applicationId }: { jobId: string, applicationId: string }) {
    const res = await tenantApiClient.post(`/jobs/${jobId}/jobApplication/${applicationId}/interviewInvitation`)
    return res.data
}
export async function videoInterviewResult({ jobId, candidateId }: { jobId: string, candidateId: string }) {
    const res = await tenantApiClient.get(`/jobs/${jobId}/candidate/${candidateId}/interviewResult`)
    return res.data
}


export async function interviewEvaluationResults({ candidateInterviewId }: { candidateInterviewId: string }) {
    const res = await tenantApiClient.get(`/candidateInterview/${candidateInterviewId}/interviewEvaluationResults`)
    return res.data
}



// candidate

export async function getVideoInterviewAnswers() {
    const res = await apiClient.get(`v1/videoInterviews`)
    return res.data
}
export async function updateStatusInterviewVideo({ videoInterviewId, payload }: { videoInterviewId: string, payload: any }) {
    const res = await apiClient.patch(`v1/videoInterview/${videoInterviewId}`, payload)
    return res.data
}


export async function getVideoInterviewQuestion({ interviewId }: { interviewId: string }) {
    const res = await apiClient.get(`v1/videoInterviewQuestion/${interviewId}`)
    return res.data
}

// save video

export async function saveInterviewVideo({ videoInterviewId, payload }: { videoInterviewId: string, payload: any }) {
    const res = await apiClient.post(`v1/videoInterview/${videoInterviewId}/videoAnswer`, payload)
    return res.data
}

export async function getVideoPresignedUrl({ fileKey }: { fileKey: string }) {
    const res = await apiClient.get(`/v1/upload/video-presigned-url/${fileKey}`)
    return res.data
}

