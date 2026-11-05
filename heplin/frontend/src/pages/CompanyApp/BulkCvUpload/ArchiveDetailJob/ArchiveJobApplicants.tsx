import { useEffect, useMemo, useState } from 'react';
import {
    Avatar,
    Card,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
    TextField,
    Grid,
    Box,
} from '@mui/material';
import { format, intlFormatDistance, isValid } from 'date-fns';
import { useParams, useSearchParams } from 'react-router-dom';
import { DownloadCVButton } from 'src/components';
import {
    useGetAllArchiveJobApplicationsQuery,
    useGetMyEmployeeDataQuery,
} from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';
import { addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import { Paginate } from 'src/components/shared';
import { ApplicantMatchingRateChip } from '../../Jobs/DetailJob/components';

export function Component() {
    const { t } = useTranslation();
    const { id } = useParams();
    const params = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const [searchParams, setSearchParams] = useSearchParams();

    const [range, setRange] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection',
        },
    ]);

    const [isTime, setIsTime] = useState('all');

    const activeCandidateId = searchParams.get('candidateId');
    const jobId = params?.id;
    const employeeDataQuery = useGetMyEmployeeDataQuery();

    const openApplicantDetail = (candidateId: string, applicationId: string) => {
        setSearchParams((prev) => {
            prev.set('candidateId', candidateId);
            return prev;
        });
        const payload = {
            viewedBy: employeeDataQuery?.data?.employee?._id,
            operation: 'add',
        };

    };

    const pageSizes = [6, 12, 25];
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0;
    const limit =
        useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0];

    const name = useMemo(() => searchParams.get('name')?.toString(), [searchParams]) || '';

    const query = useMemo(() => {
        let queryStr = '';
        if (name) queryStr += `&name=${name}`;
        return queryStr;
    }, [name]);

    const { data, refetch, isFetching, isPreviousData } = useGetAllArchiveJobApplicationsQuery({
        jobId: id!,
        query: query,
        page,
        limit,
    });


    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Enter') {
                refetch();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [searchParams, refetch]);

    return (
        <Box sx={{ p: 2 }}>
            <Card sx={{ p: 3, mb: 3, border: '1px solid #E31E24' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('FilterApplicants')}
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth
                            label={t('Name')}
                            variant="outlined"
                            value={name}
                            onChange={(e) =>
                                setSearchParams((prev) => {
                                    prev.set('name', e.target.value);
                                    return prev;
                                })
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') refetch();
                            }}
                        />
                    </Grid>




                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <LoadingButton
                            loading={isFetching}
                            variant="contained"
                            onClick={() => refetch()}
                            sx={{ height: 56, width: "50%" }}


                        >
                            {t('filter')}
                        </LoadingButton>
                    </Grid>
                </Grid>
            </Card>

            <Paginate isFetching={isFetching || isPreviousData} pageSizes={pageSizes} count={data?.count}>
                <Card sx={{ p: 3, border: '1px solid #E31E24' }}>
                    <Table>
                        <thead>
                            <TableRow>
                                <TableCell align="left" sx={{ width: '30%' }}>
                                    {t('Candidate')}
                                </TableCell>
                                <TableCell align="center" sx={{ width: '25%' }}>
                                    {t('Heplin Ai')}
                                </TableCell>
                                <TableCell align="center" sx={{ width: '25%' }}>
                                    {t('ApplicationDate')}
                                </TableCell>
                                <TableCell align="right" sx={{ width: '20%' }}>
                                    {t('Actions')}
                                </TableCell>
                            </TableRow>
                        </thead>
                        <TableBody>
                            {data?.results?.length ? (
                                data.results.map((application: any) => {
                                    const isSeen = application?.viewedBy?.some(
                                        (v: any) =>
                                            v?.employeeId === employeeDataQuery?.data?.employee?._id &&
                                            v.isSeen
                                    );

                                    return (
                                        <TableRow
                                            key={application?._id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openApplicantDetail(
                                                    application?.candidateId?._id,
                                                    application?._id
                                                );
                                            }}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                // backgroundColor: isSeen ? '#FFFFFF' : '#F2F6FC',
                                                transition: 'all 200ms',
                                            }}
                                        >
                                            <TableCell align="left">
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar src={application.candidateId?.userId?.avatar}>
                                                        {application?.candidateId?.name?.[0]}
                                                        {application?.candidateId?.surname?.[0]}
                                                    </Avatar>
                                                    <Typography variant={isSeen ? 'subtitle2' : 'body1'}>
                                                        {application?.candidateId?.name}{' '}
                                                        {application?.candidateId?.surname}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <ApplicantMatchingRateChip
                                                    rate={application?.candidateScore * 10}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip
                                                    title={
                                                        isValid(new Date(application.createdAt))
                                                            ? format(new Date(application.createdAt), 'yyyy.MM.dd HH:mm')
                                                            : ''
                                                    }
                                                >
                                                    <Typography
                                                        color="text.secondary"
                                                        variant={isSeen ? 'subtitle2' : 'body1'}
                                                        sx={{ textTransform: 'capitalize' }}
                                                    >
                                                        {isValid(new Date(application.createdAt))
                                                            ? intlFormatDistance(new Date(application.createdAt), new Date(), {
                                                                numeric: 'always',
                                                            })
                                                            : ''}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                <Tooltip title={t('Download CV')}>
                                                    <Box component="span">
                                                        <DownloadCVButton
                                                            fileName={`${application.candidateId?.name}-${application.candidateId?.surname}-cv.pdf`}
                                                            id={application.cv}
                                                        />
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        sx={{ background: '#FFCDD2', borderRadius: '8px' }}
                                    >
                                        <Typography align="center" variant="subtitle1">
                                            {t('There are no applications')}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </Paginate>
        </Box>
    );
}

Component.displayName = 'JobApplicants';
