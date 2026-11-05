import { useMutation, useQuery } from "@tanstack/react-query";
import { createJobApplicationService, deleteJobService, getAllJobsOfAdminTenantService, getAllRecruitmentStagesOfTenantService, getJobApplicationsOfJobService, getJobDetailService, postNewJobService, updateFormFieldsJobService, updateGeneralInfoJobService, updateJob, updateJobApplicantQuestonsService, updateJobSkillsService } from "src/services/admin";

export function useGetAllJobsOfAdminTenant(query?: string, enabled?: boolean) {
    return useQuery(['admin-jobs', query], () => getAllJobsOfAdminTenantService(query), {
        keepPreviousData: true,
        enabled
    });
}

export function useGetJobDetailQuery({ jobId }: { jobId: string }) {
    return useQuery(
        ["job-detail", jobId],
        () => getJobDetailService({ jobId }),
        { enabled: !!jobId }
    )
}

export function useGetJobApplicationsOfJobQuery({ jobId, query }: { jobId: string, query?: string }) {
    return useQuery(
        ["job-applications", jobId, query],
        () => getJobApplicationsOfJobService({ jobId, query }),
        { enabled: !!jobId }
    )
}
export function useCreateJobApplicationMutation() {
    return useMutation(createJobApplicationService)
}

export function useUpdateJobMutation() {
    return useMutation(updateJob)
}
export function useCreateJobMutation() {
    return useMutation(postNewJobService)
}

export function useUpdateGeneralInfoOfJobMutation() {
    return useMutation(updateGeneralInfoJobService);
}

export function useUpdateJobApplicantQuestonsMutation() {
    return useMutation(updateJobApplicantQuestonsService);
}

export function useUpdateFormFieldsOfJobMutation() {
    return useMutation(updateFormFieldsJobService);
}

export function useUpdateSkillsOfJobMutation() {
    return useMutation(updateJobSkillsService);
}

export function useGetAllRecruitmentStagesOfTenantQuery({ tenantId, query }: { tenantId: string, query?: string }) {
    return useQuery(
        ["admin-recruitmentStages", tenantId, query],
        () => getAllRecruitmentStagesOfTenantService(tenantId, query),
        { enabled: !!tenantId }
    )
}
export function useDeleteJobMutation() {
    return useMutation(deleteJobService);
}