import { Tab, Tabs } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, matchPath } from 'react-router-dom';

const tabOptions = [
  {
    label: 'Genel Bakış',
    value: '',
  },
  {
    label: 'Pano',
    value: 'board',
  },
  {
    label: 'Tüm Başvuranlar',
    value: 'all-applicants',
  },
  {
    label: 'Değerlendirmeler',
    value: 'evaluated',
  },
  {
    label: "Bursiyer Alımı",
    value: "onboarding",
  },
  {
    label: "Kabul Edilen Bursiyerler",
    value: "hired",
  },
];

export default function DetailJobTabs() {
  const { t } = useTranslation();
  const location = useLocation();

  const matchedValue = useMemo(() => {
    return tabOptions.find((opt) =>
      matchPath(`/:companySlug/jobs/:jobId/${opt.value}`, location.pathname)
    )?.value;
  }, [location.pathname]);

  return (
    <Tabs
      value={matchedValue}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: '2px solid #f0f0f0',
        '& .MuiTabs-indicator': {
          backgroundColor: '#E31E24',
          height: 3,
        },
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          color: '#666',
          minHeight: 48,
          padding: '12px 24px',
          '&:hover': {
            color: '#E31E24',
            opacity: 1,
          },
          '&.Mui-selected': {
            color: '#E31E24',
            fontWeight: 600,
          },
        },
      }}
    >
      {tabOptions.map((tab) => (
        <Tab
          to={`${tab.value}`}
          key={tab.value}
          label={tab.label}
          component={Link}
          value={tab.value}
        />
      ))}
    </Tabs>
  );
}
