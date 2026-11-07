import { Suspense, type FC, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

import 'src/global.css';
// Remove if locales are not used
import 'src/locales/i18n';

import { RTL } from 'src/components/rtl';

import { Toaster } from 'src/components/toaster';
import { SettingsConsumer, SettingsProvider } from 'src/contexts/settings';
import { useNprogress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { Outlet } from 'react-router';
import { AuthProvider, NewMailProvider, useNewMail } from './providers';
import { isAdminApp, isCompanyApp } from './utils';
import { NewMail, CookieConsent } from './components/shared';
import { FloatingEmailIcon } from './components/FloatingEmailIcon';
import { FloatingSupportEmail } from './components';
import ErrorBoundary from './errorboundary';
import CreateComment from './components/shared/Comment/CreateComment';

//TODO: move to inside CompanyApp layout
const CompanyAppSettingsDrawer = lazy(() => import('src/pages/CompanyApp/Settings'));
const AdminAppSettingsDrawer = lazy(() => import('src/pages/AdminApp/Settings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: FC = () => {
  useNprogress();
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      style={{ maxWidth: 300 }}
      autoHideDuration={1500}
    >
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SettingsProvider>
            <SettingsConsumer>
              {(settings) => {
                // Prevent theme flicker when restoring custom settings from browser storage
                if (!settings.isInitialized) {
                  // return null;
                }

                const theme = createTheme({
                  colorPreset: settings.colorPreset,
                  contrast: settings.contrast,
                  direction: settings.direction,
                  paletteMode: settings.paletteMode,
                  responsiveFontSizes: settings.responsiveFontSizes,
                });

                return (
                  <ThemeProvider theme={theme}>
                    <Helmet>
                      <meta
                        name="color-scheme"
                        content={settings.paletteMode}
                      />
                      <meta
                        name="theme-color"
                        content={theme.palette.neutral[900]}
                      />
                    </Helmet>
                    <RTL direction={settings.direction}>
                      <CssBaseline />
                      <AuthProvider>
                        {/* <NewMailProvider> */}
                        {/* <FloatingEmailIcon /> */}
                        <FloatingSupportEmail />
                        {/* <NewMail /> */}
                        <CreateComment />
                        <Suspense>
                          {isCompanyApp() ? <CompanyAppSettingsDrawer /> : null}
                          {isAdminApp() ? <AdminAppSettingsDrawer /> : null}
                          <ErrorBoundary>
                            <Outlet />
                          </ErrorBoundary>
                        </Suspense>
                        {/* </NewMailProvider> */}
                      </AuthProvider>
                      {/* 
                      @author: muhammed.yozgatli
                      Temadan gelen özellikler olduğu için yorum satırına alındı 
                      <SettingsButton onClick={settings.handleDrawerOpen} />
                      <SettingsDrawer
                        canReset={settings.isCustom}
                        onClose={settings.handleDrawerClose}
                        onReset={settings.handleReset}
                        onUpdate={settings.handleUpdate}
                        open={settings.openDrawer}
                        values={{
                          colorPreset: settings.colorPreset,
                          contrast: settings.contrast,
                          direction: settings.direction,
                          paletteMode: settings.paletteMode,
                          responsiveFontSizes: settings.responsiveFontSizes,
                          stretch: settings.stretch,
                          layout: settings.layout,
                          navColor: settings.navColor,
                        }}
                      /> */}
                      <Toaster />
                    </RTL>
                  </ThemeProvider>
                );
              }}
            </SettingsConsumer>
          </SettingsProvider>
        </LocalizationProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

