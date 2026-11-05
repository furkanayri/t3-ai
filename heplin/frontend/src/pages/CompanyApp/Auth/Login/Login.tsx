import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Seo } from 'src/components/seo';
import AuthLayout from '../AuthLayout';
import { RouterLink } from 'src/components/router-link';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/providers';
import LoginWithEmailAndPassword from './LoginWithEmailAndPassword';
import LoginWithPhoneNumber from './LoginWithPhoneNumber';
import { Button, Divider } from '@mui/material';
import { LinkedIn } from '@mui/icons-material';
import { isAccountsApp, isCompanyApp } from 'src/utils';
import { useSignInLinkedinMutation } from 'src/hooks/useServices';
import { useCallbackLinkedinMutation } from "src/hooks/useServices";
import { useEffect } from 'react';
import store from 'store';

export const Component = () => {
  const { t } = useTranslation();
  const signInLinkedinMutation = useSignInLinkedinMutation();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const registerLinkedinMutation = useCallbackLinkedinMutation();
  const isAccounts = isAccountsApp()
  const isCompany = isCompanyApp()

  const isRedirectToExternal = redirectParam?.startsWith('http');
  const { activeMethod, setActiveMethod } = useAuth()


  const handleLinkedInLogin = async () => {
    try {
      const response = await signInLinkedinMutation.mutateAsync({
        redirectUri: redirectParam ?? ""
      });

      if (response?.redirectUrl) {
        window.location.href = response.redirectUrl;
      }
    } catch (error) {
      console.error("LinkedIn login failed:", error);
    }
  }

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleLinkedinAuth(code);
    }
  }, [searchParams]);

  const handleLinkedinAuth = async (authCode: string) => {
    try {
      const response = await registerLinkedinMutation.mutateAsync({
        authCode,
      });


      if (response?.token) {
        store.set('token', response?.token);

        window.location.href = `https://accounts.heplin.com`

      }
    } catch (error) {
      console.error("LinkedIn Auth Error:", error);
    }
  };

  return (
    <AuthLayout>
      <Seo title="Login" />
      <div>
        <Stack spacing={2}>
          <Stack
            sx={{ mb: 4 }}
            spacing={1}
          >
            <Typography gutterBottom variant="h5">{t('Log in')}</Typography>
            {/* {isAccounts && <Typography
              color="text.secondary"
              variant="body2"
            >
              {t("Don't have an account?")}&nbsp;
              <Link
                component={RouterLink}
                href={`/register${redirectParam ? `?redirect=${redirectParam}` : ''}`}
                underline="hover"
                variant="subtitle2"
              >
                {t('Register')}
              </Link>
            </Typography>} */}
            {
              activeMethod === "emailAndPassword" && <LoginWithEmailAndPassword />
            }
            {
              activeMethod === "phone" && <LoginWithPhoneNumber />
            }
          </Stack>
          {
            isAccounts &&
            <Divider
              sx={{
                my: 2
              }}
            />
          }
          {/* {activeMethod !== "phone" && <Button
            fullWidth
            color="inherit"
            onClick={() => {
              setActiveMethod("phone")
            }}
          >
            Login with Phone
          </Button>} */}
          {activeMethod !== "emailAndPassword" && <Button
            fullWidth
            color="inherit"
            onClick={() => {
              setActiveMethod("emailAndPassword")
            }}
          >
            Login with Email
          </Button>}
          {/* <Button
            fullWidth
            color='inherit'
            startIcon={
              <Google />
            }
            component="a"
            href={`${API_BASE_URL}/auth/google${isRedirectToExternal ? `?contunie=${redirectParam}` : ""}`}
          >
            Login with Google
          </Button> */}
          {/* 
          {
            isAccounts &&
            <Button
              fullWidth
              color='inherit'
              sx={{ color: "#0e76a8" }}
              startIcon={
                <LinkedIn style={{ color: "#0e76a8" }} />
              }
              onClick={handleLinkedInLogin} // Buton tıklamasında handleLinkedInLogin fonksiyonu tetiklenecek
            >
              {t('SignInwithLinkedin')}
            </Button>
          } */}


        </Stack>
      </div>
    </AuthLayout>
  );
};

Component.displayName = 'Login';
