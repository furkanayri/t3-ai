import { useCallback, useRef, useMemo } from 'react';
import { Seo } from 'src/components/seo';
import { JobPost } from 'src/types/jobPost/jobPost';
import { useGetArchiveJobsQuery } from 'src/hooks/useServices';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert, Tab, Tabs } from '@mui/material';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';

import { Add } from '@mui/icons-material';
import { CustomButton, Paginate } from 'src/components/shared';
import { JobPostListTable } from '../../Jobs/ListJob/sections';
import { ArchiveJobPostListTable } from '../ListArchiveJob/Table';



export const ListArchiveJobPage = () => {
    const { t } = useTranslation();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const { companySlug } = useParams();
    const navigate = useNavigate();

    const pageSizes = [12, 25, 50]
    const [searchParams, setSearchParams] = useSearchParams()

    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const query = useMemo(() => `&page=${page + 1}&limit=${limit}`, [page, limit])

    const jobsQuery = useGetArchiveJobsQuery(query);

    const jobsData = array<JobPost>(jobsQuery.data?.results);
    const handleJobOpen = useCallback(
        (jobId: string): void => {
            navigate(`/${companySlug}/bulk-cv-upload/jobs/${jobId}`);
        },
        [navigate, companySlug]
    );





    return (
        <>
            <Seo title="JobPost: JobPost List" />
            <div >

                <div
                    className='mt-[20px]'
                // style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
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
                                <ArchiveJobPostListTable
                                    count={jobsQuery.data?.total}
                                    items={jobsData}
                                    // onPageChange={jobsSearch.handlePageChange}
                                    // onRowsPerPageChange={jobsSearch.handleRowsPerPageChange}
                                    onSelect={handleJobOpen}
                                // page={jobsSearch.state.page}
                                // rowsPerPage={jobsQuery.data?.limit}
                                />
                            </Paginate>
                        )}
                </div>
            </div>
        </>
    );
};

ListArchiveJobPage.displayName = 'JobLists';
