import { adminApiClient } from "src/libs/apiClient"

export async function getAllUsersService({ query }: { query?: string }) {
    const res = await adminApiClient.get(`/users?${query || ''}`)
    return res.data
}
export async function getUserService({ userId }: { userId: string, }) {
    const res = await adminApiClient.get(`/users/${userId}`)
    return res.data
}
export async function getUserExperiencesService({ userId }: { userId: string, }) {
    const res = await adminApiClient.get(`/users/${userId}/experiences`)
    return res.data
}
export async function updateUserExperiencesService({ userId, experiencesId, payload }: { userId: string, experiencesId: string, payload: any }) {
    const res = await adminApiClient.patch(`/users/${userId}/experiences/${experiencesId}`, payload)
    return res.data
}
export async function deleteUserExperienceService({ userId, experienceId }: { userId: string, experienceId: string }) {
    const res = await adminApiClient.delete(`/users/${userId}/experiences/${experienceId}`)
    return res.data
}
export async function createUserExperienceService({ userId, payload }: { userId: string, payload: any }) {
    const res = await adminApiClient.post(`/users/${userId}/experiences`, payload)
    return res.data
}
export async function getUserEducationsService({ userId }: { userId: string, }) {
    const res = await adminApiClient.get(`/users/${userId}/educations`)
    return res.data
}
export async function updateUserEducationsService({ userId, educationId, payload }: { userId: string, educationId: string, payload: any }) {
    const res = await adminApiClient.patch(`/users/${userId}/educations/${educationId}`, payload)
    return res.data
}
export async function deleteUserEducationService({ userId, educationId }: { userId: string, educationId: string }) {
    const res = await adminApiClient.delete(`/users/${userId}/educations/${educationId}`)
    return res.data
}
export async function createUserEducationsService({ userId, payload }: { userId: string, payload: any }) {
    const res = await adminApiClient.post(`/users/${userId}/educations`, payload)
    return res.data
}
export async function getUserCertificatesService({ userId }: { userId: string, }) {
    const res = await adminApiClient.get(`/users/${userId}/certificates`)
    return res.data
}
export async function updateUserCertificateService({ userId, certificateId, payload }: { userId: string, certificateId: string, payload: any }) {
    const res = await adminApiClient.patch(`/users/${userId}/certificates/${certificateId}`, payload)
    return res.data
}
export async function deleteUserCertificateService({ userId, certificateId }: { userId: string, certificateId: string }) {
    const res = await adminApiClient.delete(`/users/${userId}/certificates/${certificateId}`)
    return res.data
}
export async function createUserCertificatesService({ userId, payload }: { userId: string, payload: any }) {
    const res = await adminApiClient.post(`/users/${userId}/certificates`, payload)
    return res.data
}
export async function getUserLanguagesService({ userId }: { userId: string, }) {
    const res = await adminApiClient.get(`/users/${userId}/languages`)
    return res.data
}
export async function deleteUserLanguageService({ userId, languageId }: { userId: string, languageId: string }) {
    const res = await adminApiClient.delete(`/users/${userId}/languages/${languageId}`)
    return res.data
}
export async function updateUserLanguageService({ userId, languageId, payload }: { userId: string, languageId: string, payload: any }) {
    const res = await adminApiClient.patch(`/users/${userId}/languages/${languageId}`, payload)
    return res.data
}
export async function createUserLanguageService({ userId, payload }: { userId: string, payload: any }) {
    const res = await adminApiClient.post(`/users/${userId}/languages`, payload)
    return res.data
}
export async function getUserSkillsService({ userId }: { userId: string, }) {
    const res = await adminApiClient.get(`/users/${userId}/skills`)
    return res.data
}
export async function updateUserSkillService({ userId, skillId, payload }: { userId: string, skillId: string, payload: any }) {
    const res = await adminApiClient.patch(`/users/${userId}/skills/${skillId}`, payload)
    return res.data
}
export async function deleteUserSkillService({ userId, skillId }: { userId: string, skillId: string }) {
    const res = await adminApiClient.delete(`/users/${userId}/skills/${skillId}`)
    return res.data
}

export async function createUserSkillService({ userId, payload }: { userId: string, payload: any }) {
    const res = await adminApiClient.post(`/users/${userId}/skills`, payload)
    return res.data
}

export async function createUserService({ payload }: { payload: any }) {
    const res = await adminApiClient.post(`/users`, payload)
    return res.data
}
export async function updateUserService({ userId, payload }: { userId: string, payload: any }) {
    const res = await adminApiClient.patch(`/users/${userId}`, payload)
    return res.data
}
export async function getUserCvsService({ userId }: { userId: string, }) {
    const res = await adminApiClient.get(`/users/${userId}/cvs`)
    return res.data
}
export async function deleteUserCVFileService({ userId, cvId }: { userId: string, cvId: string }) {
    const res = await adminApiClient.delete(`/users/${userId}/cvs/${cvId}`)
    return res.data
}

export async function createUserCvService({ userId, payload }: { userId: string, payload: any }) {
    const res = await adminApiClient.post(`/users/${userId}/cv`, payload)
    return res.data
}
