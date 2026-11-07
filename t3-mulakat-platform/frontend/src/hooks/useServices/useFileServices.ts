import { useMutation, useQuery } from '@tanstack/react-query';
import {
  certificateUploadFileService,
  cvUploadFileService,
  deleteCVFileService,
  getAllCandidateCvFiles,
  getMyCvFiles,
  privateFileUploadService,
  publicUploadFileService,
  publicUploadTenantCompanyService,
  updateCVService,
} from 'src/services';

export function useGetAllCandidateCvFilesQuery(
  {
    candidateId,
  }: {
    candidateId: string;
  },
  options?: {
    onSuccess?: (data: any) => void;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery(['cvFiles'], () => getAllCandidateCvFiles({ candidateId }), {
    onSuccess: options?.onSuccess,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export function useGetMyCVsQuery(options?: {
  onSuccess?: (data: any) => void;
  refetchOnWindowFocus?: boolean;
}) {
  return useQuery(['myCVs'], () => getMyCvFiles(), {
    onSuccess: options?.onSuccess,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export function useCVUploadFileMutation() {
  return useMutation(cvUploadFileService);
}

export function useCertificateUploadFileMutation() {
  return useMutation(certificateUploadFileService);
}

export function usePublicUploadFileMutation() {
  return useMutation(publicUploadFileService)
}
export function usePublicUploadTenantCompanyMutation() {
  return useMutation(publicUploadTenantCompanyService)
}

export function usePrivateFileUploadMutation() {
  return useMutation(privateFileUploadService)
}

export function useUpdateCVFileService() {
  return useMutation(updateCVService);
}

export function useDeleteCVFileService() {
  return useMutation(deleteCVFileService);
}
