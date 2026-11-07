import { useMemo, useRef } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, Grid } from '@mui/material';
import { CandidatesListTable, PageHeader } from './sections';
import { Container } from '@mui/system';
import { Seo } from 'src/components/seo';
import { useSearchParams } from 'react-router-dom';
import { useGetAllJobsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { JobPost } from 'src/types/jobPost';
import CandidateApplicantDetailDrawer from 'src/pages/CompanyApp/Jobs/DetailJob/sections/CandidateApplicantDetail/CandidateApplicantDetail';
import { useGetAllCandidates } from 'src/hooks/useServices/admin';
import CandidateSearch from './sections/CandidateSearch';
import { Paginate } from 'src/components/shared';

export function Component() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const subTenantId = useMemo(() => searchParams.get('subtenant'), [searchParams]) ?? ''

  const jobsQuery = useGetAllJobsQuery();
  const jobsData = array<JobPost>(jobsQuery.data?.results);

  const pageSizes = [6, 12, 25, 60];
  const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
  const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

  const query = useMemo(() => {
    let _query = ''
    _query += `page=${page + 1}&limit=${limit}`
    subTenantId ? _query += `&tenantId=${subTenantId}` : ''

    return _query
  }, [subTenantId, page, limit])


  const candidatesQuery = useGetAllCandidates(query)
  const candidates = array(candidatesQuery?.data?.results);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const openCandidateDetail = (candidateId: string) => {
    setSearchParams((prev) => {
      prev.set('candidateId', candidateId);
      return prev;
    });
  };

  if (candidatesQuery.isError)
    return <Alert severity="error">{(candidatesQuery?.error as any)?.message}</Alert>;


  return (
    <>
      <CandidateApplicantDetailDrawer />
      <Seo title="JobPost: JobPost List" />
      <div className='pr-[55px] w-full overflow-x-scroll'>
        <PageHeader />
        

        <Paginate
          isFetching={candidatesQuery.isFetching || candidatesQuery.isPreviousData}
          pageSizes={pageSizes}
          count={candidatesQuery?.data?.count}
        >
          {candidatesQuery?.isLoading ? (
            <CircularProgress />
          ) : candidates.length === 0 ? (
            <Alert severity="warning" sx={{ mt: '20px' }}>{t('noCandidatesFound')}</Alert>
          ) : (
            <CandidatesListTable
              items={candidates}
              jobList={jobsData}
              openCandidatePanel={openCandidateDetail}
            />
          )}
        </Paginate>
      </div>
    </>
  );
}

Component.displayName = 'CandidatesList';
