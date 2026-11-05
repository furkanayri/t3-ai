import { Close, DoDisturb, Edit, Mail, MoreVert } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { red } from '@mui/material/colors';
import { Suspense, lazy, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { SeverityPill } from 'src/components/severity-pill';
import { tenants } from 'src/fakedata/tenants';

const tabs = [
  {
    label: 'General',
    value: 'general',
  },
  {
    label: 'Subscription',
    value: 'subscription',
  },
];

const GeneralInfo = lazy(() => import('./GeneralInfo'));
const Subscription = lazy(() => import('./Subscription'));

export default function TenantDetail() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [activeTab, setActiveTab] = useState('general');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTenantId = searchParams.get('tenantId');

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const onClose = () =>
    setSearchParams((prev) => {
      prev.delete('tenantId');
      return prev;
    });

  const tenant = useMemo(() => {
    return tenants.find((_app) => _app._id === activeTenantId);
  }, [activeTenantId]);

  const isOpen = !!activeTenantId && !!tenant;
  const { t } = useTranslation();
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      anchor="right"
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: '60vw',
        },
      }}
      sx={{ flexShrink: 0 }}
    >
      <Box>
        <header className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-x-4">
            <Avatar src={tenant?.company.logo}>{tenant?.company?.name?.[0] ?? ''}</Avatar>
            <Typography variant="h5">{tenant?.company.name}</Typography>
            <SeverityPill>{tenant?.status}</SeverityPill>
          </div>
          <div className="flex items-center gap-x-4">
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleCloseMenu}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('editTenantInfo')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <Mail fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('sendMail')}</ListItemText>
              </MenuItem>

              <Divider />
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <DoDisturb
                    color="error"
                    fontSize="small"
                  />
                </ListItemIcon>
                <ListItemText style={{ color: red[400] }}>{t('makePassive')}</ListItemText>
              </MenuItem>
            </Menu>

            <Divider
              orientation="vertical"
              flexItem
            />
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </div>
        </header>
        <Divider />
        <Card sx={{ boxShadow: 'none !important' }}>
          <Tabs
            indicatorColor="primary"
            scrollButtons="auto"
            textColor="primary"
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{ px: 3, pt: 2 }}
            variant="scrollable"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={t(tab.label)}
                value={tab.value}
              />
            ))}
          </Tabs>
          <Divider />
          <CardContent sx={{ p: 0, boxShadow: 'none !important' }}>
            <div className="px-3 pt-3">
              <Suspense>
                {activeTab === 'general' && <GeneralInfo tenant={tenant} />}
                {activeTab === 'subscription' && <Subscription tenant={tenant} />}
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </Box>
    </Drawer>
  );
}
