import apiClient, { tenantApiClient } from "src/libs/apiClient";

export async function getAllInterviewService() {
    const res = await tenantApiClient.get(`/interviews`);

    return res.data;
}
export async function createInterviewService(payload: any) {
    const res = await tenantApiClient.post(`/interviews`, payload);

    return res.data;
}
export async function deleteInterviewService({ id }: { id: string }) {
    const res = await tenantApiClient.delete(`/interviews/${id}`);
    return res.data;
}

//interviewQuestions
export async function updateInterviewQuestionService({ id, payload }: { id: string, payload: any }) {
    const res = await tenantApiClient.patch(`/interviews/${id}/interviewQuestions`, payload);
    return res.data;
}
export async function createInterviewQuestionWithJobService({ jobId, numberOfQuestions, lang }: { jobId: string, numberOfQuestions: string, lang: string }) {
    const res = await tenantApiClient.post(`/job/${jobId}/createInterviewQuestion`, { numberOfQuestions: numberOfQuestions, lang: lang });
    return res.data;
}
export async function createInterviewQuestionWithTextService({ payload }: { payload: { prompt: string, numberOfQuestions: string, lang: string } }) {
    const res = await tenantApiClient.post(`/createInterviewQuestion`, payload);
    return res.data;
}
export async function getAllInterviewQuestionsService({ interviewId }: { interviewId: string }) {
    const res = await tenantApiClient.get(`/interviews/${interviewId}/interviewQuestions`);
    return res.data;
}
export async function updateInterviewQuestionToVoice({ interviewId, questionId }: { interviewId: string, questionId: string }) {
    const res = await tenantApiClient.patch(`/interviews/${interviewId}/question/${questionId}/quesitonToVoice`);
    return res.data;
}



export async function createCandidateInterviewInvitationService({ jobId, applicationId, payload }: { jobId: string, applicationId: string, payload: any }) {
    const res = await tenantApiClient.post(`/jobs/${jobId}/jobApplication/${applicationId}/candidateInvitation`, payload);
    return res.data;
}

export async function getAllCandidateInterview() {
    const res = await apiClient.get(`/v1/candidateInterview`);
    return res.data;
}
export async function getOneCandidateInterview({ interviewId }: { interviewId: string }) {
    const res = await apiClient.get(`/v1/candidateInterview/${interviewId}`);
    return res.data;
}
export async function getInterviewQuestion({ interviewId }: { interviewId: string }) {
    const res = await apiClient.get(`/v1/candidateInterviewQuestion/${interviewId}`);
    return res.data;
}
export async function updateCandidateInterview({ interviewId, payload }: { interviewId: string, payload: any }) {
    const res = await apiClient.patch(`/v1/candidateInterview/${interviewId}`, payload);
    return res.data;
}
export async function updateCandidateInterviewLogs({ interviewId, payload }: { interviewId: string, payload: any }) {
    const res = await apiClient.patch(`/v1/candidateInterview/${interviewId}/interviewlogs`, payload);
    return res.data;
}

export async function getOneCandidateAnswer({ interviewAnswer }: { interviewAnswer: string }) {
    const res = await apiClient.get(`/v1/candidateAnswers/${interviewAnswer}`);
    return res.data;
}

export async function updateCandidateAnswer({ candidateAnswerId, payload }: { candidateAnswerId: string, payload: any }) {
    const res = await apiClient.patch(`/v1/candidateAnswers/${candidateAnswerId}`, payload);
    return res.data;
}
export async function updateCandidateVideoAnswer({ candidateAnswerId, payload }: { candidateAnswerId: string, payload: any }) {
    const res = await apiClient.patch(`/v1/candidateVideoAnswers/${candidateAnswerId}`, payload);
    return res.data;
}

export async function getTenantInterviewList({ jobId, jobApplicationId, interviewType, query }: { jobId: string, jobApplicationId: string, interviewType: string, query: string }) {
    const res = await tenantApiClient.get(`/jobId/${jobId}/jobApplicationId/${jobApplicationId}/listanswers?interviewType=${interviewType}&${query}`);
    return res.data;
}





export async function getTenantInverviewAnswer({ candidateAnswersId }: { candidateAnswersId: string }) {
    const res = await tenantApiClient.get(`/candidateAnswersId/${candidateAnswersId}`);
    return res.data;
}
export async function videoInterviewEvaluation({ interviewId, candidateAnswersId }: { interviewId: string, candidateAnswersId: string }) {
    const res = await tenantApiClient.patch(`/interview/${interviewId}/candidateAnswers/${candidateAnswersId}/videoInterviewEvaluation`)
    return res.data
}

export async function textInterviewEvaluation({ interviewId, candidateAnswersId }: { interviewId: string, candidateAnswersId: string }) {
    const res = await tenantApiClient.patch(`/interview/${interviewId}/candidateAnswers/${candidateAnswersId}/textInterviewEvaluation`)
    return res.data
}

export async function retrieveCandidateInterview({ jobId, jobApplicantId }: { jobId: string, jobApplicantId: string }) {
    const res = await tenantApiClient.get(`/interview/applicant/${jobApplicantId}/job/${jobId}`);
    return res.data;
}

export async function generatePresignedUrlService({ fileName, contentType, questionId }: {
    fileName: string,
    contentType: string,
    questionId: string
}) {
    const res = await apiClient.post(`/v1/upload/generate-presigned-url`, {
        fileName,
        contentType,
        questionId
    });
    return res.data;
}

export async function uploadVideoToR2Service({ presignedUrl, videoBlob }: {
    presignedUrl: string,
    videoBlob: Blob
}) {
    const res = await fetch(presignedUrl, {
        method: 'PUT',
        body: videoBlob,
        headers: {
            'Content-Type': 'video/webm',
        }
    });

    if (!res.ok) {
        throw new Error('Failed to upload video to storage');
    }

    return res;
}

export async function bulkInterviewInvitationService({
    interviewId,
    excelFile,
    interviewType
}: {
    interviewId: string,
    excelFile: File,
    interviewType: 'video' | 'text'
}) {
    const formData = new FormData();
    formData.append('excel', excelFile);
    formData.append('interviewType', interviewType);

    const res = await tenantApiClient.post(
        `/interviews/${interviewId}/bulk-invitation`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );

    return res.data;
}

export async function getInterviewAnswersByTypeService({
    interviewType,
    candidateId,
    page,
    limit
}: {
    interviewType: string,
    candidateId?: string,
    page?: number,
    limit?: number
}) {
    const queryParams = new URLSearchParams({
        interviewType,
        ...(page && { page: page.toString() }),
        ...(limit && { limit: limit.toString() }),
    });

    const res = await tenantApiClient.get(`candidates/${candidateId}/interviews/answersByType?${queryParams.toString()}`);
    return res.data;
}

export interface BatchVideoEvaluationResult {
    id: string;
    candidateAnswerId: string;
    answerId: string;
    questionId?: string;
    question?: string;
    evaluationCriteria?: string;
    status: 'SUCCESS' | 'FAILED';
    transcript: string | null;
    evaluationScore: number | null;
    evaluationReasoning: string | null;
    diagnostics: {
        hasAudio?: boolean | null;
        averageVolumeDb?: number;
        videoDurationSeconds?: number;
        processingTimeSeconds?: number;
        errors?: string[];
    } | null;
    modelVersions: {
        whisper?: string;
        whisperDevice?: string;
        whisperComputeType?: string;
        llm?: string;
    } | null;
    processedAt: string | null;
}

export async function getBatchVideoEvaluationService({
    candidateAnswerId,
}: {
    candidateAnswerId: string;
}): Promise<{ results: BatchVideoEvaluationResult[] }> {
    const res = await tenantApiClient.get(
        `/candidateAnswers/${candidateAnswerId}/batchVideoEvaluation`
    );
    return res.data;
}
