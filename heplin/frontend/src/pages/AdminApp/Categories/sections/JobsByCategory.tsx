import {
    Alert,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useGetJobsByCategoryQuery } from 'src/hooks/useServices';
import { t } from 'i18next';
import { CustomButton, Paginate } from 'src/components/shared';
import { FileExportIcon } from 'hugeicons-react';
import ExportExcelButton from './CreateExcelFile';

export function Component() {
    const [searchParams] = useSearchParams();
    const { categoryId } = useParams();
    const pageSizes = [9, 12, 20];
    const page = useMemo(() => Number(searchParams.get('page')?.toString()) || 0, [searchParams]);
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()) || pageSizes[0], [searchParams]);
    const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit]);
    const jobsQuery = useGetJobsByCategoryQuery(categoryId ?? "", query);
    const jobs = jobsQuery.data?.results || [];

    return (
        <>
            <div className='pr-[55px]'>
                <div className='flex justify-between mb-[30px]'>
                    <p className='text-2xl font-medium'>{jobs.length ? jobs[0]?.categoryId?.name : t('jobs')}</p>
                    <CustomButton
                        startIcon={<FileExportIcon size={18} />}
                    >
                        <ExportExcelButton jobs={jobs} />
                    </CustomButton>
                </div>
                <div
                    className='mt-[20px]'
                    style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
                >
                    {
                        jobsQuery.isError ? (
                            <Alert severity="error">{(jobsQuery?.error as any)?.message}</Alert>
                        ) : !jobsQuery.isLoading && jobs.length === 0 ? (
                            <Alert severity="info">{t('thereAreNoJobs')}</Alert>
                        ) : (
                            <Paginate
                                isFetching={jobsQuery.isFetching || jobsQuery.isPreviousData}
                                pageSizes={pageSizes}
                                count={jobsQuery?.data?.count}
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('companyName')}</TableCell>
                                            <TableCell>{t('tenantPhone')}</TableCell>
                                            <TableCell>{t('tenantAddress')}</TableCell>
                                            <TableCell>{t('jobTitle')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {jobs.map((job: { id: any; title: any; tenantId: any }) => (
                                            <TableRow key={job.id}>
                                                <TableCell>{job.tenantId.name}</TableCell>
                                                <TableCell>{job.tenantId.phone}</TableCell>
                                                <TableCell>{job.tenantId.address}</TableCell>
                                                <TableCell>{job.title}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paginate>
                        )
                    }
                </div>
            </div>
        </>
    );
}

Component.displayName = 'JobsByCategory';
