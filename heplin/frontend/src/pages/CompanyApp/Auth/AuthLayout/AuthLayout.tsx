import { useEffect, useMemo, type FC, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import store from 'store';
import { Logo } from 'src/components/logo';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { useTranslation } from 'react-i18next';
import { isAccountsApp, isAdminApp, isCompanyApp } from 'src/utils';
import { useLocation } from 'react-router';
import { Link } from '@mui/material';
import ChangeLanguage from '../Register/ChangeLanguage';

interface LayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<LayoutProps> = ({ children }) => {
  const isCompany = isCompanyApp();
  const isAdmin = isAdminApp();
  const isAccounts = isAccountsApp();

  const location = useLocation();
  const onLoginPage = useMemo(() => location.pathname.includes('/login'), [location.pathname]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    if (redirectParam && redirectParam.startsWith('/apply/')) {
      const applyId = redirectParam.split('/apply/')[1];
      store.set('latestApplyJob', { jobId: applyId });
    }
  }, [location.search]);

  const { t } = useTranslation();
  return (
    <Box
      sx={{
        backgroundColor: '#0E1320',
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: {
          xs: 'column-reverse',
          md: 'row',
        },
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          background: 'linear-gradient(145deg, #dc2626 0%, #eee 15%, #E31E24 70%)',
          color: 'common.white',
          display: 'flex',
          flex: {
            xs: '0 0 auto',
            md: '1 1 auto',
          },
          justifyContent: 'center',
          p: {
            xs: 4,
            md: 8,
          },
        }}
      >
        <Box
          maxWidth="md"
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        >
          <Typography
            sx={{
              display: 'flex',
              justifyContent: {
                xs: 'center',
                md: 'flex-start',
              },
              mb: 10,
            }}
          >
            <img
              src="/assets/t3-logo.png"
              alt="T3"
              style={{
                filter: 'brightness(0) invert(1)',
              }}
            />
          </Typography>
          <Typography
            sx={{ mb: 1 }}
            variant="h4"
          >
            {t('Welcome to HitaIK')}
          </Typography>
          {/* <Typography
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            {t(
              'Effortless Access to Your SaaS-Powered HR Management Hub Empower your HR processes with modern efficiency.'
            )}
          </Typography> */}
          <Typography
            variant="subtitle2"
            sx={{ mb: 2 }}
          >
            {t('Join 100+ forward-thinking companies:')}
          </Typography>
          <Stack
            alignItems="center"
            direction="row"
            flexWrap="wrap"
            gap={4}
            sx={{
              color: 'text.primary',
              '& > *': {
                color: 'neutral.400',
                flex: '0 0 auto',
              },
            }}
          >
            {/*
            TODO: add logos
            <LogoSamsung />
            <LogoVisma />
            <LogoBolt />
            <LogoAws />
            <LogoAccenture />
            <LogoAtt /> */}
          </Stack>

          {/* Kullanım Klavuzu */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, color: 'common.white' }}
            >
              {t('Usage Guide')}
            </Typography>
            <Box
              sx={{
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.2)',
                maxWidth: '500px',
              }}
            >
              <video
                controls
                style={{
                  width: '100%',
                  display: 'block',
                }}
              >
                <source src="/assets/offical.mp4" type="video/mp4" />
                {t('Your browser does not support the video tag.')}
              </video>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          display: 'flex',
          flex: {
            xs: '1 1 auto',
            md: '0 0 auto',
          },
          flexDirection: 'column',
          justifyContent: {
            md: 'center',
          },
          maxWidth: '100%',
          p: {
            xs: 4,
            md: 8,
          },
          width: {
            md: 600,
          },
        }}
      >
        <div>
          <Box sx={{ position: "absolute", top: 0, right: 0 }}>
            <ChangeLanguage />
          </Box>
          <Box sx={{ mb: 4 }}>
            <Stack
              alignItems="center"
              component={RouterLink}
              direction="row"
              display="inline-flex"
              href={paths.index}
              spacing={1}
              sx={{ textDecoration: 'none' }}
            >
              {/* <Box
                sx={{
                  display: 'inline-flex',
                  height: 24,
                  width: 24,
                }}
              >
                <Logo />
              </Box> */}
              <Box
                sx={{
                  color: 'primary.main',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '0.3px',
                  lineHeight: 2.5,
                  '& span': {
                    color: 'text.primary',
                  },
                }}
              >
                T3
                <span className="pl-1">
                  {isCompany
                    ? t('companyPanel')
                    : isAdmin
                      ? t('adminPanel')
                      : isAccounts
                        ? t('accountLogin')
                        : 'App'}
                </span>
              </Box>
            </Stack>
            {!onLoginPage && (
              <Link href="/login">
                <Typography
                  color="text.primary"
                  variant="subtitle1"
                  fontSize={13}
                  sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                >
                  {t('backToLogin')}
                </Typography>
              </Link>
            )}
          </Box>
          {children}
        </div>
      </Box>
    </Box>
  );
};

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
