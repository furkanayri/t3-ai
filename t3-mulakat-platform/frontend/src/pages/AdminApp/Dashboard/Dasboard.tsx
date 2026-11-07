import { Seo } from 'src/components/seo';
import { RouterLink } from 'src/components/router-link';
import { useTranslation } from 'react-i18next';
import { DashboardCountCard } from './sections';
import { useAuth } from 'src/providers';
import { useGetAllJobsOfAdminTenant, useGetAllCandidates, useAdminGetAllApplicationsQuery } from 'src/hooks/useServices/admin';
import { array, convertPublicFileURL } from 'src/utils';
import Chart from "react-apexcharts";
import { Avatar } from '@mui/material';
import { CustomButton } from 'src/components/shared';
import { Add } from '@mui/icons-material';
import { LatestApplications } from './sections/LatestApplications';
import { FC, RefAttributes, useMemo } from 'react';
import { HugeiconsProps, JobSearchIcon, UserLove01Icon, UserSearch01Icon } from 'hugeicons-react';

type CountCardItem = {
  amount: number;
  title: string;
  href: string;
  color?: string;
  loading: boolean;
  icon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>
}

export function Component() {
  const { t } = useTranslation();
  const { user } = useAuth()
  const jobsQuery = useGetAllJobsOfAdminTenant(`page=${1}&limit=5`)

  const jobs = array(jobsQuery?.data?.results);
  let applicantNumber: number[] = []
  let jobsName: string[] = []
  jobs.map((job: any) => {
    applicantNumber.push(job?.applicationNumber)
    jobsName.push(job?.title)
  })

  const bar = {
    options: {
      chart: {
        id: "basic-bar",
        toolbar: {
          show: true,
        },
        background: '#ffffff',
        foreColor: '#333',
        dropShadow: {
          enabled: true,
          top: 0,
          left: 0,
          blur: 3,
          opacity: 0.5
        }
      },
      xaxis: {
        categories: jobsName,
        labels: {
          style: {
            colors: '#333',
            fontSize: '14px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#333',
            fontSize: '14px',
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: false,
      },
      title: {
        text: t('Applicant Numbers by Job'),
        style: {
          fontFamily: 'Satoshi',
          fontWeight: 500,
          fontSize: '16px',
          color: '#333'
        }
      },
      colors: ['#E31E24'],
    },
    series: [
      {
        name: "Applicant",
        data: applicantNumber
      }
    ]
  };

  const jobApplicationsQuery = useAdminGetAllApplicationsQuery();
  const jobApplications = array<any>(jobApplicationsQuery.data?.results);
  const latestApplications = jobApplications.slice(0, 5)
  const candidatesQuery = useGetAllCandidates()

  const dashboardCountCards: CountCardItem[] = [
    {
      title: t('allJobs'),
      href: 'jobs',
      loading: jobsQuery.isFetching,
      amount: jobsQuery?.data?.count,
      color: '#FD5FB2',
      icon: JobSearchIcon
    },
    {
      title: t('allCandidates'),
      href: 'candidates',
      loading: candidatesQuery.isFetching,
      amount: candidatesQuery?.data?.count,
      icon: UserLove01Icon
    },
    {
      title: t('numberOfApplications'),
      href: 'applications',
      loading: jobApplicationsQuery.isFetching,
      amount: jobApplicationsQuery?.data?.count,
      color: '#F0E68C',
      icon: UserSearch01Icon
    }
  ]

  return (
    <>
      <Seo title="Dashboard: Admin Overview" />
      <div className='pr-[55px]'>
        <div className='flex justify-between mb-[40px]'>
          <div className='flex gap-2 items-center'>
            <Avatar
              sx={{
                height: 59,
                width: 59,
                textTransform: 'uppercase',
              }}
              src={convertPublicFileURL(user?.avatar)}
            >
              {user?.name?.[0]}
              {user?.surname?.[0]}
            </Avatar>
            <div>
              <p className='text-[20px] font-medium leading-7'>
                {new Date().getHours() < 12 ? t('goodMorning') : new Date().getHours() < 18 ? t('goodAfternoon') : t('goodEvening')}
                {', '}
                {user?.name}
              </p>
              <p className='text-sm text-[#B3B3B3]'>{t('Manage_your_HR_recruitment')}</p>
            </div>
          </div>
          <CustomButton
            startIcon={<Add />}
            LinkComponent={RouterLink}
            href='jobs/create'
          >
            {t("newJobPost")}
          </CustomButton>
        </div>

        <div className='flex gap-[14px] mb-[18px] max-md:flex-col'>
          {
            dashboardCountCards.map((props, index) =>
              <DashboardCountCard
                key={index}
                {...props}
              />
            )
          }
        </div>
        <div className='flex w-full max-w-6xl gap-4 max-md:flex-col '>
          <div className='  max-md:w-full mb-[18px]'>
            <LatestApplications
              loading={jobApplicationsQuery.isLoading}
              fetching={jobApplicationsQuery.isFetching}
              onRefetch={() => jobApplicationsQuery.refetch()}
              applications={latestApplications}
              error={
                jobApplicationsQuery.isError
                  ? (jobApplicationsQuery.error as any)?.message
                  : undefined
              }
            />
          </div>
          <div className='w-full p-5 rounded-[13px]'
            style={{
              boxShadow: "0px 4px 14.8px 0px #A6A6A640"
            }}
          >
            <Chart
              options={bar.options}
              series={bar.series}
              height={'300px'}
              type="bar"
            />
          </div>
        </div>

      </div>
    </>
  );
}

Component.displayName = 'Dashboard';
