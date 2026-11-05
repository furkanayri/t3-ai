import { useState, useCallback, useRef, useMemo } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';

import { usePageView } from 'src/hooks/use-page-view';
import { Seo } from 'src/components/seo';
import { JobPostListTable } from './sections';
import { JobPost } from 'src/types/jobPost/jobPost';
import { useGetAllJobsQuery } from 'src/hooks/useServices';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert, Tab, Tabs } from '@mui/material';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { CustomButton, Paginate } from 'src/components/shared';
import { RouterLink } from 'src/components/router-link';
import { Add } from '@mui/icons-material';

interface Filters {
  query?: string;
  status?: string;
}

type SortDir = 'asc' | 'desc';

interface JobsSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy?: string;
  sortDir?: SortDir;
}
const useJobsSearch = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<JobsSearchState>({
    filters: {
      query: undefined,
      status: undefined,
    },
    page: 0,
    rowsPerPage: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handleSortChange = useCallback((sortDir: SortDir): void => {
    setState((prevState) => ({
      ...prevState,
      sortDir,
    }));
  }, []);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    []
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

const tabs = [
  { label: "Active Listings", value: "published" },
  { label: "Pending", value: "pending" },
  { label: "Closed", value: "closed" },
]

export const Component = () => {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const jobsSearch = useJobsSearch();
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<"published" | "pending" | "closed">('published');

  const pageSizes = [12, 25, 50]
  const [searchParams, setSearchParams] = useSearchParams()

  const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
  const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

  const query = useMemo(() => `status=${currentTab}&page=${page + 1}&limit=${limit}`, [page, limit, currentTab])

  const jobsQuery = useGetAllJobsQuery(query);

  const jobsData = array<JobPost>(jobsQuery.data?.results);
  const handleJobOpen = useCallback(
    (jobId: string): void => {
      navigate(`/${companySlug}/jobs/${jobId}`);
    },
    [navigate, companySlug]
  );
  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setCurrentTab(value as any);
  }, []);

  const buttonStyles = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 5px #E31E24;
    }
    50% {
      box-shadow: 0 0 15px #E31E24;
    }
    100% {
      box-shadow: 0 0 5px #E31E24;
    }
  }

  .neon-button {
    animation: pulse 2s infinite;
    border: 1px solid #E31E24 !important;
    transition: all 0.3s ease !important;
  }

  .neon-button:hover {
    box-shadow: 0 0 20px #E31E24 !important;
    background-color: #E31E24 !important;
    color: white !important;
    border-color: #E31E24 !important;
  }
  
  .neon-button:hover * {
    color: white !important;
  }
`;


  return (
    <>
      <style>{buttonStyles}</style>
      <Seo title="JobPost: JobPost List" />
      <div className='pr-[55px]'>
        <div className='flex justify-between mb-[30px]'>
          <p className='text-2xl font-medium'>{t('jobPosts')}</p>
          <CustomButton
            className="neon-button"
            startIcon={<Add />}
            LinkComponent={RouterLink}
            href='create'
            sx={{
              backgroundColor: 'transparent !important',
              color: '#E31E24 !important',
              '&:hover': {
                backgroundColor: '#E31E24 !important',
                color: 'white !important',
              },
              '& .MuiButton-startIcon': {
                color: 'inherit',
              }
            }}
          >
            {t("newJobPost")}
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
        <div
          className='mt-[20px]'
          style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
        >
          {
            jobsQuery.isError ? (
              <Alert severity="error">{(jobsQuery?.error as any)?.message}</Alert>
            ) : !jobsQuery.isLoading && jobsData.length === 0 ? (
              <Alert severity="info">{t('thereAreNoJobs')}</Alert>
            ) : (
              <Paginate
                isFetching={jobsQuery.isFetching || jobsQuery.isPreviousData}
                pageSizes={pageSizes}
                count={jobsQuery?.data?.count}
              >
                <JobPostListTable
                  count={jobsQuery.data?.total}
                  items={jobsData}
                  onPageChange={jobsSearch.handlePageChange}
                  onRowsPerPageChange={jobsSearch.handleRowsPerPageChange}
                  onSelect={handleJobOpen}
                  page={jobsSearch.state.page}
                  rowsPerPage={jobsQuery.data?.limit}
                />
              </Paginate>
            )}
        </div>
      </div>
    </>
  );
};

Component.displayName = 'JobLists';
