import { Close, DoDisturb, Edit, Mail, MoreVert } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
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
  useTheme,
} from '@mui/material';
import { red } from '@mui/material/colors';
import { MouseEvent, Suspense, lazy, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SeverityPill } from 'src/components/severity-pill';
import { users } from 'src/fakedata/users';
import CandidateProfile from './CandidateProfile';
import AppliedJobs from './AppliedJobs';
import { useTranslation } from 'react-i18next';

const tabs = [
  {
    label: 'General',
    value: 'general',
  },
  {
    label: 'Candidate Profile',
    value: 'candidate',
  },
  {
    label: 'Applied Jobs',
    value: 'applied_jobs',
  },
];

const GeneralInfo = lazy(() => import('./GeneralInfo'));

export default function CandidateDetail() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [activeTab, setActiveTab] = useState('general');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCandidateId = searchParams.get('candidateId');

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const onClose = () => {
    setActiveTab('general');
    setSearchParams((prev) => {
      prev.delete('candidateId');
      return prev;
    });
  };

  const user = useMemo(() => {
    return users.find((_app) => _app._id === activeCandidateId);
  }, [activeCandidateId]);

  const isOpen = !!activeCandidateId && !!user;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      anchor="right"
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: { xs: '100vw', sm: '80vw', md: '65vw' },
          background: theme.palette.neutral[50],
          boxShadow: theme.shadows[8],
          overflowY: 'auto',
        },
      }}
      sx={{ flexShrink: 0 }}
    >
      <Box sx={{ backgroundColor: theme.palette.neutral[50] }}>
        <header className="flex items-center justify-between px-6 py-6 bg-white border-b shadow-sm">
          <div className="flex items-center gap-x-4">
            <Avatar
              src={user?.avatar}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: theme.palette.primary.main,
                fontSize: '1.25rem',
                fontWeight: 600,
                border: `3px solid ${theme.palette.primary.lightest}`,
                boxShadow: `0 2px 8px ${theme.palette.primary.alpha30}`,
              }}
            >
              {user?.name?.[0] ?? ''}
            </Avatar>
            <div>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  letterSpacing: '-0.025em',
                }}
              >
                {user?.name}
              </Typography>
              <div className="mt-1">
                <SeverityPill>{user?.status}</SeverityPill>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
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
                <ListItemText>Edit User Info</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <Mail fontSize="small" />
                </ListItemIcon>
                <ListItemText>Send Mail</ListItemText>
              </MenuItem>

              <Divider />
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <DoDisturb
                    color="error"
                    fontSize="small"
                  />
                </ListItemIcon>
                <ListItemText style={{ color: red[400] }}>Make Passive</ListItemText>
              </MenuItem>
            </Menu>

            <Divider
              orientation="vertical"
              flexItem
            />
            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: theme.palette.neutral[100],
                color: theme.palette.neutral[500],
                '&:hover': {
                  backgroundColor: theme.palette.neutral[200],
                  color: theme.palette.neutral[700],
                },
                transition: 'all 0.2s',
              }}
            >
              <Close />
            </IconButton>
          </div>
        </header>
        <div className="p-4">
          <Card sx={{
            boxShadow: theme.shadows[2],
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper,
            overflow: 'hidden',
          }}>
            <Tabs
              indicatorColor="primary"
              scrollButtons="auto"
              textColor="primary"
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              sx={{
                px: 2,
                pt: 2,
                backgroundColor: theme.palette.background.paper,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  minHeight: '42px',
                  px: 2.5,
                  py: 1.5,
                  mx: 0.5,
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.alpha4,
                    color: theme.palette.primary.main,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.darkest,
                    },
                  },
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                />
              ))}
            </Tabs>
            <Divider sx={{ mt: 2 }} />
            <CardContent sx={{ p: 4, minHeight: 'calc(100vh - 300px)' }}>
              <Suspense>
                {activeTab === 'general' && <GeneralInfo user={user} />}
                {activeTab === 'candidate' && <CandidateProfile />}
                {activeTab === 'applied_jobs' && <AppliedJobs />}
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </Box>
    </Drawer>
  );
}
