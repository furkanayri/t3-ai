import { useMutation, useQuery } from '@tanstack/react-query';
import { getTenantUserOfPermissionsService, updateUserPermissionsService } from 'src/services';

interface IProptypes {
  memberId: string;
  tenantId: string;
  onSuccess?: (data: any) => void;
}

export function useGetTenantUsersOfPermissionQuery({ memberId, tenantId, onSuccess, }: IProptypes) {
  return useQuery(
    ['tenantUserOfPermissions'],
    () => getTenantUserOfPermissionsService({ memberId, tenantId }),
    {
      enabled: !!memberId && !!tenantId,
      onSuccess: (data: any) => {
        onSuccess && onSuccess(data);
      },
    }
  );
}

export function useUpdateUserPermissions(
  { onSuccess, onError }: { onSuccess?: (data: any) => void; onError?: (error: any) => void } = {
    onSuccess: undefined,
    onError: undefined,
  }
) {
  return useMutation(updateUserPermissionsService, {
    onSuccess: (data: any) => {
      onSuccess && onSuccess(data);
    },
    onError: (error: any) => {
      onError && onError(error);
    },
  });
}
