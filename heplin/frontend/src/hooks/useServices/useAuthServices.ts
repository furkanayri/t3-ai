import { useMutation, useQuery } from '@tanstack/react-query';
import { authorizeClientService, createProfileService, forgotPassword, getMeService, getPostingChannelsService, getTenantsOfUserService, listManageablePostingChannelsOfUser, loginService, loginWithPhoneService, logoutService, registerService, changePasswordMutation, tokenExchangeService, updateMeService, verifyOtpService, signInLinkedinService, callbackLinkedinService, checkUserPassword, verifyCodeService, } from 'src/services';

export function useGetMe(options?: {
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  enabled?: boolean;
}) {
  return useQuery(['authentication', 'me'], () => getMeService(), {
    onSuccess: (res) => {
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: options?.enabled,
  });
}

export function useAuthorizeClientQuery(payload: {
  redirect_uri: string,
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
}) {
  return useQuery(['authorization', 'client'], () => authorizeClientService({
    redirect_uri: payload.redirect_uri
  }), {
    retry: false,
    enabled: !!payload.redirect_uri,
    onSuccess: payload.onSuccess,
    onError: payload.onError
  });
}

export function useLoginMutation() {
  return useMutation(loginService, {
    retry: false,
  });
}

export function useCheckUserPasswordMutation() {
  return useMutation(checkUserPassword, {
    retry: false
  });
}

export function useVerifyCodeMutation() {
  return useMutation(verifyCodeService, {
    retry: false,
  });
}

export function useLoginWithPhoneMutation() {
  return useMutation(loginWithPhoneService, {
    retry: false
  })
}

export function useVerifyOtpMutation() {
  return useMutation(verifyOtpService, {
    retry: false
  })
}

export function useCreateProfileMutation() {
  return useMutation(createProfileService);
}

export function useRegisterMutation() {
  return useMutation(registerService);
}

export function useSignInLinkedinMutation() {
  return useMutation(signInLinkedinService);
}

export function useCallbackLinkedinMutation() {
  return useMutation(callbackLinkedinService);
}

export function useLogoutMutation() {
  return useMutation(logoutService);
}

export function useUpdateMeMutation() {
  return useMutation(updateMeService)
}

export function useExchangeToken(payload: { code: string; state: string; }, options?: {
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
}) {
  return useQuery(["authentication", "exchangeToken"], () => tokenExchangeService(payload), {
    retry: false,
    enabled: !!payload && !!payload.code && !!payload.state,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

export function useGetTenantsOfUser(options?: {
  enabled?: boolean;
}) {
  return useQuery(["authentication", "getTenantsOfUser"], () => getTenantsOfUserService(), options)
}

export function useGetPostingChannelsOfUser({ tenantId }: { tenantId: string }) {
  return useQuery(["auth", "getPostingChannels", tenantId], () => getPostingChannelsService({ tenantId }), { enabled: !!tenantId })
}

export function useListManageablePostingChannelsOfUser() {
  return useQuery(["auth", "listManageablePostingChannelsOfUser"], () => listManageablePostingChannelsOfUser());
}

export function useForgotPassword() {
  return useMutation(forgotPassword);
}



export function useChangePassword() {
  return useMutation(changePasswordMutation);
}