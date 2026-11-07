import { Business, Close } from '@mui/icons-material';
import { Box, Drawer, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { Fragment, Suspense, lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

const SETTINGS_TABS = [
  { label: 'Company Settings', value: 'general', icon: Business },

];

const SettingsTabMapper = {
  'general': lazy(() => import('./CompanySettings')),
};

export default function SettingsDrawer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const settings = useMemo(() => searchParams.get('settings'), [searchParams]);

  const activeTab = useMemo(() => searchParams.get('activeTab') || 'general', [searchParams]);

  const onClose = () => {
    setSearchParams((prev) => {
      prev.delete('settings');
      prev.delete('activeTab');
      return prev;
    });
  };

  const open = settings === 'open';

  const ActiveComponent =
    SettingsTabMapper[activeTab as keyof typeof SettingsTabMapper] ?? Fragment;

  return (
    <Drawer
      anchor={'bottom'}
      open={open}
      onClose={onClose}
    >
      <header className="py-4 px-4 border-b flex items-center justify-between">
        <Typography variant="h6">{t('settings')}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </header>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          alignItems: 'flex-start',
          display: 'flex',
          height: '90vh',
          py: '24px',
          px: '24px',
          columnGap: '50px',
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={activeTab}
          onChange={(e, value) =>
            setSearchParams((prev) => {
              prev.set('activeTab', value);
              return prev;
            })
          }
          sx={{
            border: 1,
            borderColor: 'divider',
            width: 240,
            background: 'white',
            borderRadius: '8px',
          }}
        >
          {SETTINGS_TABS.map((setting, index) => {
            const Icon = setting.icon;
            return (
              <Tab
                icon={<Icon />}
                sx={{
                  marginLeft: '0 !important',
                  paddingLeft: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '8px',
                  justifyContent: 'flex-start',
                  flexDirection: 'row',
                  '> svg': {
                    marginBottom: '0 !important',
                  },
                  textAlign: "start"
                }}
                label={t(setting.label)}
                key={setting.value}
                value={setting.value}
              />
            );
          })}
        </Tabs>
        <Suspense>
          <ActiveComponent />
        </Suspense>
      </Box>
    </Drawer>
  );
}
