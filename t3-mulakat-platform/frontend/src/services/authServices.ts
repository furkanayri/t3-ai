import { apiClient } from 'src/libs';
import { CreateProfilePayload, LinkedInRegisterPayload, RegisterPayload } from 'src/types/user';

export async function tokenExchangeService(payload: {
  code: string;
  state: string;
}) {
  const response = await apiClient.post("/v1/oauth/exchange", {
    oauthCode: payload.code,
    state: payload.state,
  })

  return response.data;
}

export async function loginService(payload: { email: string; password: string }) {
  const response = await apiClient.post('/v1/auth/login', payload);

  return response.data;
}

export async function checkUserPassword(payload: { email: string; }) {
  const response = await apiClient.post('/v1/auth/checkUserPassword', payload);

  return response.data;
}

export async function verifyCodeService(payload: {
  verificationToken: string;
  code: string;
  newPassword: string;
}) {
  const response = await apiClient.post('/v1/auth/verifyCode', payload);
  return response.data;
}

export async function registerService(payload: RegisterPayload) {
  const response = await apiClient.post('/v1/auth/register', payload);

  return response.data;
}

export async function callbackLinkedinService(payload: LinkedInRegisterPayload) {
  const response = await apiClient.post('/v1/auth/linkedin/callback', payload);
  return response.data;
}

export async function signInLinkedinService(payload: LinkedInRegisterPayload) {
  const response = await apiClient.post('/v1/auth/linkedin', payload);
  return response.data;
}

export async function changePasswordMutation({ payload }: { payload: { password: string; token: string; id: string } }) {
  const response = await apiClient.post(`/v1/auth/changePassword`, payload);
  return response.data;
}

export async function getMeService() {
  const response = await apiClient.get("/v1/profile/getMe")

  return response.data;
}

export async function authorizeClientService(payload: { redirect_uri: string }) {
  const response = await apiClient.get(`/v1/oauth/authorize?redirect_uri=${payload.redirect_uri}`);

  return response.data
}

export async function getPostingChannelsService({ tenantId }: { tenantId: string }) {
  const response = await apiClient.get("/v1/profile/postingChannels/" + tenantId);
  return response.data;
}

export async function listManageablePostingChannelsOfUser() {
  const response = await apiClient.get("/v1/profile/listManageablePostingChannels");

  return response.data;
}

export async function getTenantsOfUserService() {
  const response = await apiClient.get("/v1/profile/tenants")

  return response.data;
}

export async function getPermissionsOfUserService() {
  const response = await apiClient.get(`/v1/profile/permissions`)

  return response.data;
}

export async function logoutService() {
  const response = await apiClient.get(`/v1/auth/logout`)
  return response.data;

}

export async function updateMeService(payload: { name?: string, surname?: string, avatar?: string | null, isAcceptedTOS?: boolean, isAcceptedKVKK?: boolean }) {
  const res = await apiClient.patch("/v1/profile/updateMe", payload)

  return res.data
}


export async function exchangeCodeService(payload: { code: string; state: string }) {
  const response = await apiClient.post(`/oauth/exchange`, {
    oauthCode: payload.code,
    state: payload.state,
  });

  return response.data;
}

export async function loginWithPhoneService(payload: { phoneNumber: string }) {
  const response = await apiClient.post(`/sendSmsOtp`, payload);

  return response.data;
}

export async function verifyOtpService(payload: { phoneNumber: string; otpCode: string }) {
  const response = await apiClient.post(`/verifySmsOtp`, payload);

  return response.data;
}

export async function createProfileService(payload: CreateProfilePayload) {
  const res = await apiClient.post('/v1/profile/create', payload);

  return res.data;
}

export async function forgotPassword({ email }: { email: string }) {
  const res = await apiClient.post('/v1/auth/forgot-password', { email });
  return res.data;
}
export async function createPasswordForWithoutRegister({ email, password }: { email: string, password: string }) {
  const res = await apiClient.post('/v1/auth/new-password', { email, password });
  return res.data;
}

