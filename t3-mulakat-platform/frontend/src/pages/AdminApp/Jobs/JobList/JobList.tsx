import { SyntheticEvent, useMemo, useRef } from 'react';
import { usePageView } from 'src/hooks/use-page-view';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { Seo } from 'src/components/seo';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, CircularProgress, Tab, Tabs } from '@mui/material';
import { JobFilters, JobPostListTable } from './components';
import { useGetAllTenantsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { useGetAllPostingChannels } from 'src/hooks/useServices/admin';
import { PostingChannel } from 'src/types';
import { useGetAllJobsOfAdminTenant } from 'src/hooks/useServices/admin';
import { PopulatedJobPost } from 'src/types/jobPost';
import { Paginate } from 'src/components/shared';
import { useAuth } from 'src/providers';
import { RouterLink } from 'src/components/router-link';

const JOBLIST_TABS = [
  { label: 'Drafts', value: 'draft' },
  { label: 'Tenant Job Posts', value: 'tenants' },
  { label: 'Admin Job Posts', value: 'admin' },
  { label: 'Job Post Requests', value: 'pending' },
  { label: 'Closure Requests', value: 'pendingClosure' },
  { label: 'Closed Job Posts', value: 'closed' },
  { label: 'Declined', value: 'declined' },
];

export const Component = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams()

  const { activeTenantId } = useAuth()
  usePageView();

  //Filters
  const _id = searchParams.get("_id") ?? '';
  const tenantId = searchParams.get("tenantId") ?? '';
  const title = searchParams.get("title") ?? '';
  const channelId = searchParams.get("channelId") ?? '';

  const activeTab = useMemo(() => searchParams.get('activeTab') || 'tenants', [searchParams]);

  const parentTenantId = searchParams.get("parentTenantId") ?? activeTenantId;
  const status = searchParams.get("status") ?? 'published';

  const pageSizes = [6, 12, 25];
  const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0;
  const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0];

  const tenantsQuery = useGetAllTenantsQuery();
  const tenants = array<any>(tenantsQuery.data?.results);
  const channelsQuery = useGetAllPostingChannels({ adminTenantId: activeTenantId ?? '', query: !!tenantId ? `tenantId=${tenantId}` : '' })
  const channels = array<PostingChannel>(channelsQuery?.data?.results)

  const query = useMemo(() => {
    let str = `page=${page + 1}&limit=${limit}`
    if (_id) str += `&_id=${_id}`
    if (tenantId) str += `&tenantId=${tenantId}`
    if (title) str += `&title=${title}`
    if (channelId) str += `&channelId=${channelId}`
    if (parentTenantId && ["tenants", "admin"].includes(activeTab)) str += `&parentTenantId=${parentTenantId}`
    if (status) str += `&status=${status}`
    return str
  }, [page, limit, tenantId, channelId, status, parentTenantId, _id, title]);


  const jobsQuery = useGetAllJobsOfAdminTenant(query);
  const jobs = array<PopulatedJobPost>(jobsQuery?.data?.results);

  const handleTabsChange = (event: SyntheticEvent<Element, Event>, value: any) => {
    setSearchParams((prev) => {
      prev.delete('page');
      prev.delete('limit');

      prev.set('activeTab', value);

      if (["draft", "pending", "declined", "pendingClosure", "closed"].includes(value)) {
        prev.delete('parentTenantId');
        prev.set('status', value);
      }
      else {
        prev.set('parentTenantId', activeTenantId ?? '');
        prev.delete('status');
      }

      if (value === 'tenants')
        prev.set('parentTenantId', activeTenantId ?? '');

      if (value === 'admin')
        prev.set('parentTenantId', 'null')

      return prev;
    })
  }

  return (
    <>
      <Seo title="JobPost: JobPost List" />
      <div className='pr-[55px] w-full overflow-x-scroll'>

        <div className='flex justify-between'>
          <p className="text-[24px] font-medium">
            {t('jobPosts')}
          </p>
          <Button
            LinkComponent={RouterLink}
            href='create'
            startIcon={
              <SvgIcon>
                <PlusIcon />
              </SvgIcon>
            }
            variant="contained"
          >
            {t('newJobPost')}
          </Button>
        </div>

        <div className='flex flex-col'>
          <Tabs
            value={activeTab}
            onChange={handleTabsChange}
          >
            {JOBLIST_TABS.map((item, ind) => {
              return (
                <Tab
                  tabIndex={ind}
                  label={t(item.label)}
                  key={item.value}
                  value={item.value}
                />
              )
            })}

          </Tabs>
          <JobFilters
            tenants={tenants}
            channels={channels}
            isFetching={channelsQuery.isFetching}
          />
        </div>

        <div className='flex flex-col py-[22px] rounded-[13px]'
          style={{
            boxShadow: "0px 4px 14.8px 0px #A6A6A640"
          }}
        >
          {jobsQuery.isError ? (
            <Alert severity="error">{(jobsQuery?.error as any)?.message}</Alert>
          ) : jobs.length === 0 ? (
            <Alert severity="info">{t('thereAreNoJobs')}</Alert>
          ) : (
            <Paginate
              isFetching={jobsQuery.isFetching || jobsQuery.isPreviousData}
              pageSizes={pageSizes}
              count={jobsQuery?.data?.count}
            >
              {
                jobsQuery.isFetching ? (

                  <div className='w-full flex justify-center my-16'>
                    <CircularProgress />
                  </div>
                ) :
                  jobs?.length === 0 ? (
                    <Alert severity="info">{t('thereAreNoJobs')}</Alert>

                  ) :
                    <JobPostListTable
                      items={jobs}
                      channels={channels}
                      refetchJobs={jobsQuery.refetch}
                    />
              }
            </Paginate>

          )}
        </div>
      </div >
    </>
  );
};

Component.displayName = 'JobLists';
