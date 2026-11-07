import { useMutation, useQuery } from '@tanstack/react-query';
import { changeStatusTeamMember, changeStatusTenant, changeStatusTenantMember, createTenantCompanyService, createTenantService, getAllParentTenants, getAllTenants, getTenantInfo, getTenantMembers, inviteResend, inviteTenantMember, revokeTenantMember, tenantQrService, updateTenantInfo } from 'src/services';

export function useGetAllTenantsQuery(query?: string) {
  return useQuery(["tenants-list", query], () => getAllTenants(query), {
    keepPreviousData: true
  })
}

export function useGetAllParentTenantsQuery() {
  return useQuery(["tenants", "parents"], () => getAllParentTenants())
}

export function useGetTenantInfoQuery({ tenantId }: { tenantId: string }) {
  return useQuery(['tenants', tenantId], () => getTenantInfo({ tenantId }), {
    enabled: !!tenantId,
  });
}

export function useUpdateTenantInfoMutation() {
  return useMutation(updateTenantInfo);
}

export function useCreateTenantServiceMutation() {
  return useMutation(createTenantService)
}

export function useCreateTenantServiceCompanyMutation() {
  return useMutation(createTenantCompanyService)
}

export function useGetTenantMembersQuery({ tenantId, query }: { tenantId: string, query?: string }) {
  return useQuery(['tenants', 'members', tenantId, query], () => getTenantMembers({ tenantId, query }), {
    enabled: !!tenantId, keepPreviousData: true
  });
}

export function useInviteTenantMemberMutation() {
  return useMutation(inviteTenantMember)
}

export function useResendInviteTenantMemberMutation() {
  return useMutation(inviteResend)
}

export function useRevokeTenantMemberMutation() {
  return useMutation(revokeTenantMember)
}

export function useChangeTenantMemberStatusMutation() {
  return useMutation(changeStatusTenantMember)
}

export function useChangeTenantStatusMutation() {
  return useMutation(changeStatusTenant)
}

export function useChangeTeamMemberStatusMutation() {
  return useMutation(changeStatusTeamMember)
}
export function useTenantQrMutation() {
  return useMutation(tenantQrService)
}