import React, { useEffect } from 'react';
import type { FC } from 'react';
import type { ChangeEvent } from 'react';
import { Suspense, lazy, useCallback, useState } from 'react';

import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { CustomButton } from 'src/components/shared';
import { Add } from '@mui/icons-material';
import { RouterLink } from 'src/components/router-link';
import { Tab, Tabs } from '@mui/material';

const UpcomingMeetings = lazy(() => import('./sections/UpcomingMeetingsTab'));
const CompletedMeetings = lazy(() => import('./sections/CompletedMeetingsTab'));
//const MeetingCalendar = lazy(() => import('./MeetingCalendarTab'));

const tabs = [
  { label: 'Upcoming Meetings', value: 'upcoming' },
  { label: 'Completed Meetings', value: 'completed' },
  //TODO: add meeting calendar tab back on V.0.0.2
  // { label: 'Meeting Calendar', value: 'calendar' },
];

export const Component: FC = () => {
  const { t } = useTranslation()
  const [currentTab, setCurrentTab] = useState<"upcoming" | "completed">('upcoming');
  const [searchParams, setSearchParams] = useSearchParams()

  usePageView();

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setCurrentTab(value as any);
  }, []);


  useEffect(() => {
    setSearchParams((prev) => {
      prev.delete('page');
      prev.delete('limit');
      return prev;
    })
  }, [currentTab])

  return (
    <>
      <Seo title="Dashboard: Account" />
      <div className='pr-[55px]'>
        <div className='flex justify-between items-center mb-[30px] w-full pr-8'>
          <p className='text-2xl font-medium'>{t('meetings')}</p>
          <CustomButton
            LinkComponent={RouterLink}
            href='create'
            startIcon={<Add />}
            className='flex-shrink-0'
          >
            {t('newMeeting')}
          </CustomButton>
        </div>
        <Tabs
          onChange={handleTabsChange}
          scrollButtons="auto"
          value={currentTab}
          variant="scrollable"
          sx={{
            "& .Mui-selected": { color: "#E31E24!important", },
            "& .MuiTabs-indicator": { backgroundColor: "#E31E24" },
          }}

        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={t(tab.label)}
              value={tab.value}
              sx={{ color: "#141B34", }}
            />
          ))}
        </Tabs>
        <Suspense>
          {currentTab === 'upcoming' && <UpcomingMeetings />}
          {currentTab === 'completed' && <CompletedMeetings />}
          {/* {currentTab === 'calendar' && <MeetingCalendar />} */}
        </Suspense>
      </div>
    </>
  );
};
