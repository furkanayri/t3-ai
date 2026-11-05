import { useQuery, useMutation } from '@tanstack/react-query';
import {
  applyJobCandidateService,
  deleteJobService,
  getAllJobApplicationsOfCandidateService,
  getAllJobApplicationsService,
  getAllJobsService,
  getJobApplicationsOfCandidateDetailService,
  getJobDetailPublicService,
  getJobDetailService,
  postNewJobService,
  updateFormFieldsJobService,
  updateGeneralInfoJobService,
  updateJobApplicantQuestonsService,
  updateJobDescriptionService,
  updateJobService,
  updateJobSkillsService,
  updateJobStatusService,
  increaseJobViewService,
  getLatestJobApplicationsService,
  getHiringTeamsService,
  updateJobApplicationService,
  updateJobApplicationEmployeeService,
  togglePublishService,
  updateApplicant,
  updateApplicantReview,
  deleteCandidateDrawJobApplicationService,
  postAiContentJobMutation,
  bulkCVUpload,
  postArchiveJobService,
  getArchiveJobsService,
  getArchiveJobDetailService,
  getAllArchiveJobApplicationsService,
  getJobApplicationsExcelService,
} from 'src/services';

export function useGetAllJobsQuery(query?: string) {
  return useQuery(['jobs', query], () => getAllJobsService(query), { keepPreviousData: true });
}
export function useGetArchiveJobsQuery(query?: string) {
  return useQuery(['archiveJobs', query], () => getArchiveJobsService(query), { keepPreviousData: true });
}

export function useGetJobDetailQuery({ id }: { id: string, }) {
  return useQuery(['jobs', id], () => getJobDetailService({ id }), { enabled: !!id });
}
export function useGetArchiveJobDetailQuery({ id }: { id: string, }) {
  return useQuery(['archiveJobs', id], () => getArchiveJobDetailService({ id }), { enabled: !!id });
}

export function useGetJobDetailPublicQuery({ id }: { id: string }) {
  return useQuery(['jobs', 'public', id], () => getJobDetailPublicService({ id }));
}

export function useJobIncreaseViewMutation({ id }: { id: string }) {
  return useQuery(['jobs', 'increase', id], () => increaseJobViewService({ id }));
}

export function useLatestJobApplicationsQuery() {
  return useQuery(['latest', 'applications'], () => getLatestJobApplicationsService());
}

export function useGetAllJobApplicationsQuery({ jobId, query, page, limit }: { jobId?: string; query?: string; page: number; limit: number; }) {
  const queryStr = `limit=${limit}&page=${page + 1}${query ? `&${query}` : ''}`
  return useQuery(['jobs', 'applications', 'company-application', jobId, page, limit],
    () => getAllJobApplicationsService({ jobId, query: queryStr }),
    { enabled: !!jobId }
  );
}
export function useGetJobApplicationsExcelQuery({ jobId, query }: { jobId?: string; query?: string; }) {
  const queryStr = `${query ? `&${query}` : ''}`
  return useQuery(['jobs', 'applications', 'company-application', jobId, queryStr],
    () => getJobApplicationsExcelService({ jobId, query: queryStr }),
    { enabled: !!jobId }
  );
}

export function useGetAllArchiveJobApplicationsQuery({ jobId, query, page, limit }: { jobId?: string; query?: string; page: number; limit: number; }) {
  const queryStr = `limit=${limit}&page=${page + 1}${query ? `&${query}` : ''}`
  return useQuery(['archiveJobs', 'archiveApplications', 'company-application', jobId, page, limit],
    () => getAllArchiveJobApplicationsService({ jobId, query: queryStr }),
    { enabled: !!jobId }
  );
}

export function useGetHiringTeamsQuery({ id }: { id?: string; }) {
  return useQuery(['jobs', 'hiringTeam', id], () => getHiringTeamsService({ id }));
}

export function useGetAllCandidateJobApplicationsQuery() {
  return useQuery(['jobs', 'applications', 'candidate'], () =>
    getAllJobApplicationsOfCandidateService()
  );
}


export function useGetCandidateJobApplicationDetailQuery({ id }: { id: string }) {
  return useQuery(
    ['jobs', 'applications', 'candidate', id],
    () => getJobApplicationsOfCandidateDetailService({ id }),
    { enabled: !!id }
  );
}

export function useApplyJobApplicationMutation() {
  return useMutation(applyJobCandidateService);
}

export function usePostNewJobMutation() {
  return useMutation(postNewJobService);
}
export function useArchiveNewJobMutation() {
  return useMutation(postArchiveJobService);
}
export function usePostBulkCvUpload() {
  return useMutation(bulkCVUpload);
}

export function useUpdateJobMutation() {
  return useMutation(updateJobService);
}

export function useUpdateJobApplicationEmployeeMutation() {
  return useMutation(updateJobApplicationEmployeeService);
}
export function useUpdateApplicant() {
  return useMutation(updateApplicant);
}
export function useUpdateApplicantReview() {
  return useMutation(updateApplicantReview);
}

export function useUpdateGeneralInfoOfJobMutation() {
  return useMutation(updateGeneralInfoJobService);
}

export function useUpdateDescriptionOfJobMutation() {
  return useMutation(updateJobDescriptionService);
}

export function useUpdateRequirementsOfJobMutation() {
  return useMutation(updateJobService);
}

export function useUpdateFormFieldsMutation() {
  return useMutation(updateFormFieldsJobService);
}

export function useUpdateSkillsOfJobMutation() {
  return useMutation(updateJobSkillsService);
}

export function useUpdateJobStatusMutation() {
  return useMutation(updateJobStatusService);
}

export function useTogglePublishMutation() {
  return useMutation(togglePublishService)
}

export function useDeleteCandidateDrawJobApplicationMutation() {
  return useMutation(deleteCandidateDrawJobApplicationService);
}

export function useUpdateApplicantQuestionsOfJobMutation() {
  return useMutation(updateJobApplicantQuestonsService);
}

export function useDeleteJobMutation() {
  return useMutation(deleteJobService);
}

export function usePostAiContentJobMutation() {
  return useMutation(postAiContentJobMutation);
}



