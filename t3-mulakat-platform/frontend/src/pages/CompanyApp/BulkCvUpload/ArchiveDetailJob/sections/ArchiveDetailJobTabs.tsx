import { Tab, Tabs } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const tabOptions = [
    {
        label: 'overview',
        value: '',
    },
    {
        label: 'allApplicats',
        value: 'all-applicants',
    },
];

export default function ArchiveDetailJobTabs() {
    const { t } = useTranslation();
    const location = useLocation();

    const matchedValue = useMemo(() => {
        return location.pathname.includes('all-applicants') ? 'all-applicants' : '';
    }, [location.pathname]);

    return (
        <Tabs
            value={matchedValue}
            variant="scrollable"
            TabIndicatorProps={{ style: { backgroundColor: "#E31E24" } }}
            sx={{
                "& .MuiTab-root": {
                    color: "gray",
                    "&.Mui-selected": {
                        color: "#E31E24",
                    },
                },
            }}
        >
            {tabOptions.map((tab) => (
                <Tab
                    key={tab.value}
                    label={t(tab.label)}
                    component={Link}
                    to={`${tab.value}`}
                    value={tab.value}
                />
            ))}
        </Tabs>
    );
}
