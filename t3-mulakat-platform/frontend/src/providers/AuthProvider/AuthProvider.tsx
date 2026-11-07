import { Avatar, Button, Card, CardContent, Divider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { Logo } from 'src/components/logo';
import { API_BASE_URL, PERMISSION_SCOPES } from 'src/constants';
import {
  useExchangeToken,
  useGetMe,
  useLoginMutation,
  useLogoutMutation,
  useLoginWithPhoneMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useCreateProfileMutation,
  useCheckUserPasswordMutation,
  useVerifyCodeMutation,
} from 'src/hooks/useServices';
import { apiClient } from 'src/libs';
import { adminApiClient, tenantApiClient } from 'src/libs/apiClient';
import { getPermissionsOfUserService, getTenantsOfUserService } from 'src/services';
import { CreateProfilePayload, RegisterPayload } from 'src/types/user';
import { appPath, array, isAccountsApp, isAdminApp, isCompanyApp } from 'src/utils';
import store from 'store';

const AcceptPoliciesDialog = lazy(() => import('src/pages/AccountsApp/AcceptPolicies/AcceptPolicies').then(module => ({ default: module.Component })));

type LoginMethodType = 'phone' | 'emailAndPassword' | 'google';

type AuthState = {
  isLoggedIn: boolean;
  user: null | any;
  isFetching: boolean;
  hasAccess: boolean;
  activeTenant?: any;
  activeTenantId?: string | null;
  activeMethod: 'phone' | 'emailAndPassword' | 'google';
};

type AuthContextValues = {
  isLoading: boolean;
  logout: () => void;
  handleChangeActiveTenant: (tenantId: string) => void;
  refetchUser: () => Promise<any>;
  error: null | string;
  login: (email: string, password: string) => void;
  checkUser: (email: string) => Promise<{ hasPassword: boolean; verificationToken?: string }>;
  verifyCode: (verificationToken: string, code: string, newPassword: string) => void;
  loginWithPhone: (phone: string) => void;
  loginLoading: boolean;
  register: (payload: RegisterPayload) => void;
  registerLoading: boolean;
  createProfileLoading: boolean;
  createProfile: (payload: CreateProfilePayload) => void;
  sentOTPCount: number;
  closeOTPScreen: () => void;
  verifyOTP: (phoneNumber: string, code: string) => void;
  setActiveMethod: (type: LoginMethodType) => void;
} & AuthState;


const AuthContext = createContext<AuthContextValues>({
  isLoggedIn: false,
  user: null,
  hasAccess: false,
  activeTenantId: undefined,
  activeTenant: undefined,
  isFetching: false,
  isLoading: true,
  logout: () => { },
  handleChangeActiveTenant: () => { },
  refetchUser: async () => { },
  activeMethod: 'emailAndPassword',
  error: null,
  login: () => { },
  checkUser: async () => ({ hasPassword: false }),
  verifyCode: () => { },
  loginWithPhone: () => { },
  loginLoading: false,
  register: () => { },
  registerLoading: false,
  createProfileLoading: false,
  createProfile: () => { },
  sentOTPCount: 0,
  closeOTPScreen: () => { },
  verifyOTP: () => { },
  setActiveMethod: () => { },
});

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth hook must be used inside <AuthProvider> component!');

  return context;
}

const getActiveTenant = (tenants: any[], slug?: string) => {
  if (isAccountsApp()) return null;

  if (slug) return tenants?.find((t) => t?.subdomain === slug);

  const activeTenantId = store.get('activeTenantId') || tenants?.[0]?._id;

  if (!activeTenantId) return null;

  return tenants?.find((tenant) => tenant?._id === activeTenantId);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const companyInvite = searchParams.get('company-invite');

  const [sentOTPCount, setSentOTPCount] = useState(0);

  const oauthCode = searchParams.get("code") || ""
  const oauthState = searchParams.get("state") || ""

  const { enqueueSnackbar } = useSnackbar();
  const redirectParam = searchParams.get('redirect');
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    isFetching: true,
    hasAccess: false,
    activeMethod: 'emailAndPassword',
  });
  const loginMutation = useLoginMutation();
  const checkUserPasswordMutation = useCheckUserPasswordMutation();
  const verifyCodeMutation = useVerifyCodeMutation();
  const loginWithPhoneMutation = useLoginWithPhoneMutation();
  const verifyOTPMutation = useVerifyOtpMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const createProfileMutation = useCreateProfileMutation();

  const setActiveMethod = (method: LoginMethodType) => {
    setState((prev) => ({
      ...prev,
      activeMethod: method,
    }));
  };

  useExchangeToken({
    code: oauthCode,
    state: oauthState
  }, {
    onSuccess: (data) => {
      window.location.replace(appPath('/'))
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.error || "Error", {
        variant: "error"
      })

      window.location.replace(appPath('/'))
    }
  })

  const setLoggedIn = (data: any) => {
    const { user, tenant: activeTenant, permissions, token, employee } = data
    const copyUser = { ...user, permissions, employee }
    localStorage.setItem('token', token);

    if (isAdminApp()) {
      const hasPermission = permissions?.some?.((p: any) => p?.scope === PERMISSION_SCOPES.access_admin_panel && p?.allowed && p?.resource.tenantId?.includes(activeTenant?._id?.toString()))

      if (!hasPermission) {
        setState(prev => ({
          isLoggedIn: true,
          user: copyUser,
          isFetching: false,
          activeTenant: null,
          activeTenantId: null,
          hasAccess: false,
          activeMethod: prev.activeMethod,
        }))
        return enqueueSnackbar(t("You don't have permission to access this page"), { variant: "error" })
      }
    }

    tenantApiClient.defaults.baseURL = `${API_BASE_URL}/v1/tenants/${activeTenant?._id}`
    adminApiClient.defaults.baseURL = `${API_BASE_URL}/v1/admin/${activeTenant?._id}`

    store.set('token', token);

    if (!activeTenant && isCompanyApp())
      return setState(prev => ({
        isLoggedIn: true,
        user: copyUser,
        isFetching: false,
        activeTenant: null,
        activeTenantId: null,
        hasAccess: false,
        activeMethod: prev.activeMethod,
      }));

    apiClient.defaults.headers.common['tenantid'] = activeTenant?._id;
    store.set('activeTenantId', activeTenant?._id);
    setState(prev => ({
      isLoggedIn: true,
      user: copyUser,
      isFetching: false,
      activeTenant,
      activeTenantId: activeTenant?._id,
      hasAccess: true,
      activeMethod: prev.activeMethod,
    }));
  };

  const setUnLoggedIn = () => {
    localStorage.removeItem('token');
    store.remove('activeTenantId');

    setState(prev => ({
      isLoggedIn: false,
      user: null,
      isFetching: false,
      activeTenantId: undefined,
      activeTenant: undefined,
      hasAccess: false,
      activeMethod: prev.activeMethod,
    }));
  };

  const isLoginPage = useMemo(() => {
    return ['/login', '/checkUser', '/reset-password', '/forgot-password', '/register', '/create-account', '/new-password', '/accept-policies'].includes(
      location.pathname
    ) || location.pathname.includes('/reset-password/');
  }, [location.pathname]);

  const userQuery = useGetMe({
    onSuccess: async (res) => {
      setLoggedIn(res);
    },
    onError: (err) => {
      setUnLoggedIn();
    },
    enabled: isLoginPage ? (!!oauthCode && !!oauthState) : true
  });

  useEffect(() => {
    if (state.isFetching) return;

    if (state.isLoggedIn === false && !isLoginPage) {
      return navigate(`/login?redirect=${location.pathname}${location.search}`);
    }

    if (state.isLoggedIn === true && isCompanyApp()) {
      if (!params.companySlug && state.activeTenant?.subdomain) {
        return navigate(`/${state.activeTenant?.subdomain}`);
      }

      if (params.companySlug && params?.companySlug !== state.activeTenant?.subdomain) {
        return navigate(`/${state.activeTenant?.subdomain}`);
      }
    }

    if (state.isLoggedIn === true && !isCompanyApp() && isLoginPage && !companyInvite) {
      return navigate('/');
    }
  }, [
    state.isLoggedIn,
    state.isFetching,
    state.user,
    redirectParam,
    navigate,
    location.pathname,
    location.search,
    params.companySlug,
    state.activeTenant,
  ]);

  const login = (email: string, password: string) => {
    return loginMutation.mutateAsync(
      { email, password },
      {
        onSuccess: (res) => {
          setLoggedIn(res);
        },
        onError: (err: any) => {
          setUnLoggedIn();
          enqueueSnackbar(err?.response?.data?.message, { variant: 'error' });
        },
      }
    );
  };
  const checkUser = async (email: string) => {
    try {
      const res = await checkUserPasswordMutation.mutateAsync({ email });
      return res;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Error checking user';
      enqueueSnackbar(errorMessage, { variant: 'error' });

      throw new Error(errorMessage);
    }
  };

  const verifyCode = async (verificationToken: string, code: string, newPassword: string) => {
    try {
      const res = await verifyCodeMutation.mutateAsync({ verificationToken, code, newPassword });
      setLoggedIn(res);
      enqueueSnackbar(res.message, { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Verification failed', { variant: 'error' });
      throw err;
    }
  };

  const loginWithPhone = (phone: string) => {
    loginWithPhoneMutation.mutate(
      { phoneNumber: phone },
      {
        onSuccess: (res) => {
          setSentOTPCount((prev) => prev + 1);
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.response?.data?.message, { variant: 'error' });
          setUnLoggedIn();
        },
      }
    );
  };

  const createProfile = async (payload: CreateProfilePayload) => {
    createProfileMutation.mutate(payload, {
      onSuccess: async (res) => {
        if (!res.isSuccess || !res.email) return enqueueSnackbar('Error');
        enqueueSnackbar(t('profileCreatedSuccessfully'));
        await login(res.email, payload.password);

        if (companyInvite) {
          return window.location.replace(`${appPath('/login')}?redirect=/`);
        }
        else {
          return window.location.replace(appPath('/'));
        }

      },
      onError: (err: any) => {
        enqueueSnackbar(err?.response?.data?.message, { variant: 'error' });
        throw err;
      },
    });
  };

  const register = (payload: RegisterPayload) => {
    registerMutation.mutate(payload, {
      onSuccess: (res) => {
        enqueueSnackbar(t('The registration is successful'));
        setLoggedIn(res.user);
      },
      onError: (err: any) => {
        const errorMessage = t(err?.response?.data?.message);
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        setUnLoggedIn();
      },
    });
  };

  const handleChangeActiveTenant = (tenantId: string) => {
    const findedTenant = array<any>(state?.user?.tenants).find((t) => t?._id === tenantId);

    if (!findedTenant) return;

    setState((prev) => ({
      ...prev,
      activeTenant: findedTenant,
      activeTenantId: findedTenant?._id,
    }));
  };

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: (res) => {
        localStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        });
        setUnLoggedIn();
        window.location.reload();
      },
      onError: (err) => { },
    });
  };

  const closeOTPScreen = () => {
    setSentOTPCount(0);
  };

  const verifyOTP = (phoneNumber: string, code: string) => {
    verifyOTPMutation.mutate(
      { otpCode: code, phoneNumber },
      {
        onSuccess: (res) => {
          setLoggedIn(res?.user);
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.response?.data?.message, { variant: 'error' });
          //setUnLoggedIn();
        },
      }
    );
  };


  return (
    <AuthContext.Provider
      value={{
        ...state,
        isLoading: state.isFetching,
        logout,
        handleChangeActiveTenant,
        refetchUser: userQuery.refetch,
        login,
        checkUser,
        verifyCode,
        register,
        loginLoading:
          loginMutation.isLoading ||
          checkUserPasswordMutation.isLoading ||
          loginWithPhoneMutation.isLoading ||
          verifyOTPMutation.isLoading,
        registerLoading: registerMutation.isLoading,
        createProfileLoading: createProfileMutation.isLoading,
        error:
          (loginMutation.error as any)?.response?.data?.message ||
          (checkUserPasswordMutation.error as any)?.response?.data?.message ||
          (registerMutation.error as any)?.response?.data?.message ||
          (createProfileMutation.error as any)?.response?.data?.message,
        createProfile,
        loginWithPhone,
        sentOTPCount,
        closeOTPScreen,
        verifyOTP,
        setActiveMethod,
      }}
    >
      {!isLoginPage && state.isFetching ? (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            justifyContent: 'center',
            left: 0,
            p: 3,
            position: 'fixed',
            top: 0,
            width: '100vw',
            zIndex: 1400,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.5,
                },
              },
            }}
          >
            <img src="/assets/t3-logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
        </Box>
      ) : !isLoginPage && !state.isLoggedIn ? (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            justifyContent: 'center',
            left: 0,
            p: 3,
            position: 'fixed',
            top: 0,
            width: '100vw',
            zIndex: 1400,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.5,
                },
              },
            }}
          >
            <img src="/t3-favicon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
        </Box>
      ) : state.isLoggedIn &&
        isCompanyApp() &&
        !params.companySlug &&
        state.activeTenant?.subdomain ? (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            justifyContent: 'center',
            left: 0,
            p: 3,
            position: 'fixed',
            top: 0,
            width: '100vw',
            zIndex: 1400,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.5,
                },
              },
            }}
          >
            <img src="/t3-favicon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
        </Box>
      ) : state.isLoggedIn && !state.hasAccess ?
        <div className='flex h-screen items-center justify-center flex-col'>

          <Card>
            <CardContent>
              <div className='flex flex-col gap-5 '>
                <div className='flex justify-center'>
                  <Box
                    sx={{
                      height: 48,
                      width: 48,
                    }}
                  >
                    <Logo />
                  </Box>
                </div>
                <Typography variant="h6">
                  {t("You don't have permission to access this page")}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={logout}
                >
                  {t('Logout')}
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>

        : !isLoginPage && isCompanyApp() && !state.activeTenant ? (
          <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full px-4 py-6 mx-4 lg:mx-10 border rounded-md max-w-md lg:max-w-xl bg-white">
              <Typography
                variant="h6"
                sx={{ mb: 3 }}
              >
                {t('Login action required')}
              </Typography>
              <div className="bg-yellow-50 py-4 px-4 rounded-md border border-yellow-500">
                <Typography variant="body2">{t('Not have permission for this company')}</Typography>
              </div>

              <Divider sx={{ my: 3 }} />
              <div>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2 }}
                >
                  {t('Your Companies')}
                </Typography>
                <div className="divide-y">
                  {array((state.user as any)?.tenants).map((tenant: any) => (
                    <div
                      key={tenant?._id}
                      className="flex items-center justify-between pb-4"
                    >
                      <div className="flex items-center gap-x-2">
                        <Avatar src={tenant?.logo}>{tenant?.name?.[0]}</Avatar>
                        <Typography>{tenant?.name}</Typography>
                      </div>
                      <Button
                        onClick={() => {
                          window.location.replace(`/${tenant?.subdomain}`);
                        }}
                      >
                        {t('Switch Company')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Divider sx={{ my: 3 }} />
              <Button
                variant="outlined"
                color="error"
                onClick={logout}
              >
                {t('Logout')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {children}
            {state.isLoggedIn && state.user && isAccountsApp() && (!state.user.isAcceptedTOS || !state.user.isAcceptedKVKK) && (
              <Suspense fallback={null}>
                <AcceptPoliciesDialog />
              </Suspense>
            )}
          </>
        )}
    </AuthContext.Provider>
  );
}
