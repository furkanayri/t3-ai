import { useQuery, useMutation } from '@tanstack/react-query';
import {
  candidateStageUpdateService,
  deleteCandidateCertificateService,
  deleteCandidateEducationService,
  deleteCandidateSkillService,

  deleteCandidateExperienceService,
  deleteCandidateLanguageService,
  disqualifyJobApplicationService,
  getAllCandidateCertificatesService,
  getAllCandidateEducationsService,
  getAllCandidateSkillsService,

  getAllCandidateExperiencesService,
  getAllCandidateLanguagesService,
  getAllCandidatesService,
  getCandidateCertificateDetailService,
  getCandidateDetailService,
  getCandidateEducationDetailService,
  getCandidateSkillDetailService,

  getCandidateExperienceDetailService,
  postNewCandidateCertificateService,
  postNewCandidateEducationService,
  postNewCandidateSkillService,

  postNewCandidateExperienceService,
  updateCandidateCertificateService,
  getCandidateLanguageDetailService,
  postNewCandidateLanguageService,
  updateCandidateEducationService,
  updateCandidateSkillService,

  updateCandidateExperienceService,
  updateCandidateLanguageService,
  getAllCandidatesFilterService,
  getAllEducationsOfTenantService,
  candidateBlackListsService,
  removeCandidateBlackListsService,
  bulkDisqualifyJobApplicationsService,
  getArchiveCandidateDetailService,
  getAllCandidatesExcelService,
} from 'src/services';

export function useGetAllCandidatesQuery(query?: string) {

  return useQuery(['candidates', query], () => getAllCandidatesService(query), { keepPreviousData: true });
}


export function useGetAllCandidatesFilterQuery({ limit, query, }: { limit?: number; query?: string; }) {
  return useQuery(['candidates'], () => getAllCandidatesFilterService({ limit, query }));
}

export function useGetCandidateDetailQuery({ id }: { id: string }) {
  return useQuery(['candidates', id], () => getCandidateDetailService({ id }), {
    enabled: !!id,
  });
}
export function useGetArchiveCandidateDetailQuery({ id }: { id: string }) {
  return useQuery(['archiveCandidates', id], () => getArchiveCandidateDetailService({ id }), {
    enabled: !!id,
  });
}

//Candidate Languages
export function useGetAllCandidateLanguagesQuery(options?: { refetchOnWindowFocus?: boolean }) {
  return useQuery(['candidate-languages'], () => getAllCandidateLanguagesService(), {
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export function useGetCandidateLanguageDetailQuery({ id }: { id: string }) {
  return useQuery(
    ['candidate-experiences', id],
    () => getCandidateExperienceDetailService({ id }),
    {
      enabled: !!id,
    }
  );
}


export function usePostNewCandidateLanguageMutation() {
  return useMutation(postNewCandidateLanguageService);
}

export function useUpdateCandidateLanguageMutation() {
  return useMutation(updateCandidateLanguageService);
}

export function useDeleteCandidateLanguageMutation() {
  return useMutation(deleteCandidateLanguageService);
}

//Candidate Skills
export function useGetAllCandidateSkillsQuery(options?: { refetchOnWindowFocus?: boolean }) {
  return useQuery(['candidate-skills'], () => getAllCandidateSkillsService(), {
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export function useGetCandidateSkillDetailQuery({ id }: { id: string }) {
  return useQuery(
    ['candidate-skills', id],
    () => getCandidateSkillDetailService({ id }),
    {
      enabled: !!id,
    }
  );
}

export function usePostNewCandidateSkillMutation() {
  return useMutation(postNewCandidateSkillService);
}

export function useUpdateCandidateSkillMutation() {
  return useMutation(updateCandidateSkillService);
}

export function useDeleteCandidateSkillMutation() {
  return useMutation(deleteCandidateSkillService);
}
//Candidate Experiences
export function useGetAllCandidateExperiencesQuery(options?: { refetchOnWindowFocus?: boolean }) {
  return useQuery(['candidate-experiences'], () => getAllCandidateExperiencesService(), {
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export function useGetCandidateExperienceDetailQuery({ id }: { id: string }) {
  return useQuery(
    ['candidate-experiences', id],
    () => getCandidateExperienceDetailService({ id }),
    {
      enabled: !!id,
    }
  );
}

export function usePostNewCandidateExperienceMutation() {
  return useMutation(postNewCandidateExperienceService);
}

export function useUpdateCandidateExperienceMutation() {
  return useMutation(updateCandidateExperienceService);
}

export function useDeleteCandidateExperienceMutation() {
  return useMutation(deleteCandidateExperienceService);
}
//Candidate Educations
export function useGetAllCandidateEducationsQuery(options?: { refetchOnWindowFocus?: boolean }) {
  return useQuery(['candidate-educations'], () => getAllCandidateEducationsService(), {
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}
export function useGetAllEducationsOfTenantQuery(options?: { refetchOnWindowFocus?: boolean }) {
  return useQuery(['educations-of-tenant'], () => getAllEducationsOfTenantService(), {
    // refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export function useGetCandidateEducationDetailQuery({ id }: { id: string }) {
  return useQuery(['candidate-educations-detail', id], () => getCandidateEducationDetailService({ id }), {
    enabled: !!id,
  });
}

export function usePostNewCandidateEducationMutation() {
  return useMutation(postNewCandidateEducationService);
}

export function useUpdateCandidateEducationMutation() {
  return useMutation(updateCandidateEducationService);
}

export function useDeleteCandidateEducationMutation() {
  return useMutation(deleteCandidateEducationService);
}

//Candidate Certificates
export function useGetAllCandidateCertificatesQuery(options?: { refetchOnWindowFocus?: boolean }) {
  return useQuery(['candidate-certificates'], () => getAllCandidateCertificatesService(), {
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export function useGetCandidateCertificatesDetailQuery({ id }: { id: string }) {
  return useQuery(
    ['candidate-certificates', id],
    () => getCandidateCertificateDetailService({ id }),
    {
      enabled: !!id,
    }
  );
}

export function usePostNewCandidateCertificateMutation() {
  return useMutation(postNewCandidateCertificateService);
}

export function useUpdateCandidateCertificateMutation() {
  return useMutation(updateCandidateCertificateService);
}

export function useDeleteCandidateCertificateMutation() {
  return useMutation(deleteCandidateCertificateService);
}

//Candidate Steps
export function useCandidateStepUpdateMutation() {
  return useMutation(candidateStageUpdateService);
}

export function useDisqualifyJobApplicationMutation() {
  return useMutation(disqualifyJobApplicationService);
}

export function useCandidateBlackListsMutation() {
  return useMutation(candidateBlackListsService);
}

export function useRemoveCandidateBlackListsMutation() {
  return useMutation(removeCandidateBlackListsService);
}

export function useBulkDisqualifyJobApplicationsMutation() {
  return useMutation(bulkDisqualifyJobApplicationsService);
}