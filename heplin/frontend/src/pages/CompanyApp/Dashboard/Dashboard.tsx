import { Seo } from 'src/components/seo';
import {
  OverviewAllJobs,
  OverviewEvents,
  LatestApplications,
  OverviewAllCandidates,
} from './sections';
import { useAuth } from 'src/providers';
import { useGetAllMetricsQuery, useLatestJobApplicationsQuery } from 'src/hooks/useServices';
import { array, convertPublicFileURL } from 'src/utils';
import { useLatestUpcomingMeetingsQuery } from 'src/hooks/useServices/useMeetingServices';
import { RouterLink } from 'src/components/router-link';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@mui/material';
import { Add } from '@mui/icons-material';
import { CustomButton } from 'src/components/shared';
import { OverviewApplications } from './sections/OverviewApplications';
import { SparklesIcon } from 'hugeicons-react';

export const Component = () => {
  const { t } = useTranslation();
  const latestJobApplicationsQuery = useLatestJobApplicationsQuery();
  const latestUpcomingMeetingsQuery = useLatestUpcomingMeetingsQuery();
  const metricsQuery = useGetAllMetricsQuery();

  const latestJobApplications = array<any>(latestJobApplicationsQuery.data?.results);
  const latestUpcomingMeetings = array<any>(latestUpcomingMeetingsQuery.data?.results);
  const metricsData = metricsQuery?.data;
  const { user } = useAuth();

  return (
    <>
      <Seo title="Dashboard: Overview" />
      <div className='pr-[55px]'>
        <div className='mb-[40px] relative bg-gradient-to-br from-white via-red-50/30 to-orange-50/30 rounded-[24px] p-[35px] shadow-xl hover:shadow-2xl transition-all duration-300 border border-red-100/50 overflow-hidden'>
          {/* Background Pattern */}
          <div className='absolute inset-0 opacity-5'>
            <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E31E24] to-transparent rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-orange-400 to-transparent rounded-full blur-3xl'></div>
          </div>

          <div className='relative flex justify-between items-center'>
            <div className='flex gap-5 items-center'>
              <div className='relative group'>
                <div className='absolute inset-0 bg-gradient-to-br from-[#E31E24] to-[#FF6B6B] rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300'></div>
                <Avatar
                  sx={{
                    height: 85,
                    width: 85,
                    textTransform: 'uppercase',
                    position: 'relative',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '3px solid',
                    borderColor: 'background.paper',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                    '& .MuiAvatar-img': {
                      border: '3px solid',
                      borderColor: 'background.paper',
                      borderRadius: '50%'
                    }
                  }}
                  src={convertPublicFileURL(user?.avatar)}
                >
                  {user?.name?.[0]}
                  {user?.surname?.[0]}
                </Avatar>
                <div className='absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white shadow-lg'></div>
              </div>
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <p className='text-[32px] font-bold leading-9 text-gray-900'>
                    {new Date().getHours() < 12 ? t('goodMorning') : new Date().getHours() < 18 ? t('goodAfternoon') : t('goodEvening')}
                    {', '}
                    <span className='text-gray-900'>{user?.name}</span>
                  </p>
                  <SparklesIcon size={28} className='text-yellow-500 animate-pulse' />
                </div>
                <p className='text-[18px] font-medium text-gray-600 flex items-center gap-2'>
                  {t('Manage_your_HR_recruitment')}
                  <span className='text-[14px] bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold'>
                    {metricsData?.totalApplications || 0} {t('active')}
                  </span>
                </p>
              </div>
            </div>
            <CustomButton
              disabled
              startIcon={<Add className='text-[20px]' />}
              LinkComponent={RouterLink}
              href='jobs/create'
              sx={{
                background: 'linear-gradient(135deg, #E31E24 0%, #FF4444 100%)',
                color: 'white !important',
                padding: '14px 32px',
                fontSize: '17px',
                fontWeight: 600,
                borderRadius: '14px',
                textTransform: 'none',
                boxShadow: '0 6px 20px rgba(227, 30, 36, 0.35)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #C41E24 0%, #E31E24 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  zIndex: 0,
                },
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 10px 30px rgba(227, 30, 36, 0.45)',
                  color: 'white !important',

                  '& *': {
                    color: 'white !important',
                  }
                },
                '& .MuiButton-startIcon': {
                  marginRight: '10px',
                  position: 'relative',
                  zIndex: 2,
                  color: 'inherit',
                },
                '& span': {
                  position: 'relative',
                  zIndex: 2,
                  color: 'inherit',
                },
                '& .MuiButton-label': {
                  position: 'relative',
                  zIndex: 2,
                }
              }}
            >
              {t("newJobPost")}
            </CustomButton>
          </div>
        </div>
        <div className='flex gap-[14px] mb-[18px]'>
          <OverviewAllJobs
            loading={metricsQuery.isLoading}
            amount={metricsData?.totalJobs ?? 0}
          />
          <OverviewAllCandidates
            loading={metricsQuery.isLoading}
            amount={metricsData?.totalCandidates ?? 0}
          />
          <OverviewApplications
            loading={metricsQuery.isLoading}
            amount={metricsData?.totalApplications ?? 0}
          />
        </div>
        <div className='flex gap-[12px]'>
          <div className='w-[2/3] max-w-2xl'>
            <LatestApplications
              loading={latestJobApplicationsQuery.isLoading}
              fetching={latestJobApplicationsQuery.isFetching}
              onRefetch={() => latestJobApplicationsQuery.refetch()}
              applications={latestJobApplications.slice(0, 5)}
              error={
                latestJobApplicationsQuery.isError
                  ? (latestJobApplicationsQuery.error as any)?.message
                  : undefined
              }
            />
          </div>
          <div className='w-1/3 max-w-xl'>
            <OverviewEvents
              loading={latestUpcomingMeetingsQuery.isLoading}
              fetching={latestUpcomingMeetingsQuery.isFetching}
              onRefetch={() => latestUpcomingMeetingsQuery.refetch()}
              events={latestUpcomingMeetings}
              error={
                latestUpcomingMeetingsQuery.isError
                  ? (latestUpcomingMeetingsQuery.error as any)?.message
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

Component.displayName = 'Dashboard';
