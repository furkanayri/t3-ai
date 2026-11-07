import { useMutation, useQuery } from "@tanstack/react-query";
import {
    createUserCertificatesService,
    createUserCvService,
    createUserEducationsService,
    createUserExperienceService,
    createUserLanguageService,
    createUserService,
    createUserSkillService,
    deleteUserCertificateService,
    deleteUserCVFileService,
    deleteUserEducationService,
    deleteUserExperienceService,
    deleteUserLanguageService,
    deleteUserSkillService,
    getAllUsersService,
    getUserCertificatesService,
    getUserCvsService,
    getUserEducationsService,
    getUserExperiencesService,
    getUserLanguagesService,
    getUserService, getUserSkillsService,
    updateUserCertificateService,
    updateUserEducationsService,
    updateUserExperiencesService,
    updateUserLanguageService,
    updateUserService,
    updateUserSkillService
} from "src/services/admin";

export function useGetAllUsersQuery(query?: string) {
    return useQuery(['get-all-users', query], () => getAllUsersService({ query }))
}
export function useGetUserQuery(userId: string) {
    return useQuery(['get-user', userId], () => getUserService({ userId }), {
        enabled: !!userId
    })
}

export function useGetUserExperiencesQuery(userId: string) {
    return useQuery(['get-user-experiences', userId], () => getUserExperiencesService({ userId }), {
        enabled: !!userId
    })
}
export function useUpdateExperiencesMutation() {
    return useMutation(updateUserExperiencesService)
}
export function useDeleteExperienceMutation() {
    return useMutation(deleteUserExperienceService)
}

export function useCreateExperiencesMutation() {
    return useMutation(createUserExperienceService)
}
export function useDeleteEducationMutation() {
    return useMutation(deleteUserEducationService)
}

export function useGetUserEducationsQuery(userId: string) {
    return useQuery(['get-user-educations', userId], () => getUserEducationsService({ userId }), {
        enabled: !!userId
    })
}
export function useUpdateEducationMutation() {
    return useMutation(updateUserEducationsService)
}
export function useCreateEducationMutation() {
    return useMutation(createUserEducationsService)
}
export function useDeleteCertificateMutation() {
    return useMutation(deleteUserCertificateService)
}


export function useGetUserCertificatesQuery(userId: string) {
    return useQuery(['get-user-certificates', userId], () => getUserCertificatesService({ userId }), {
        enabled: !!userId
    })
}

export function useUpdateCertificateMutation() {
    return useMutation(updateUserCertificateService)
}
export function useCreateCertificateMutation() {
    return useMutation(createUserCertificatesService)
}
export function useGetUserLanguagesQuery(userId: string) {
    return useQuery(['get-user-languages', userId], () => getUserLanguagesService({ userId }), {
        enabled: !!userId
    })
}
export function useUpdateLanugageMutation() {
    return useMutation(updateUserLanguageService)
}
export function useDeleteLanguageMutation() {
    return useMutation(deleteUserLanguageService)
}
export function useCreateLanugageMutation() {
    return useMutation(createUserLanguageService)
}

export function useGetUserSkillsQuery(userId: string) {
    return useQuery(['get-user-skills', userId], () => getUserSkillsService({ userId }), {
        enabled: !!userId
    })
}
export function useDeleteSkillMutation() {
    return useMutation(deleteUserSkillService)
}
export function useUpdateSkillMutation() {
    return useMutation(updateUserSkillService)
}

export function useCreateSkillMutation() {
    return useMutation(createUserSkillService)
}

export function useCreateUserMutation() {
    return useMutation(createUserService)
}

export function useUpdateUserMutation() {
    return useMutation(updateUserService)
}
export function useGetUserCvsQuery(
    userId: string,
    options?: {
        onSuccess?: (data: any) => void;
        refetchOnWindowFocus?: boolean;
    }
) {
    return useQuery(
        ['get-user-cvs', userId],
        () => getUserCvsService({ userId }),
        {
            enabled: !!userId,
            onSuccess: options?.onSuccess,
            refetchOnWindowFocus: options?.refetchOnWindowFocus,
        }
    )
}
export function useDeleteUserCVFileService() {
    return useMutation(deleteUserCVFileService)
}


export function useCreateUserCvMutation() {
    return useMutation(createUserCvService)
}