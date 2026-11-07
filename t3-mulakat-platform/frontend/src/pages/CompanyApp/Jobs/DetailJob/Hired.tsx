import React from 'react'
import { useParams } from 'react-router';
import { useGetAllJobApplicationsQuery } from 'src/hooks/useServices';
import {
    Alert,
    Avatar,
    Box,
    Card,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Paginate } from 'src/components/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useNewMail } from 'src/providers';

export function Component() {
    const { id } = useParams();
    let query = 'status=hired';
    const { t } = useTranslation()

    const pageSizes = [6, 12, 25];
    const [searchParams, setSearchParams] = useSearchParams()
    const { openNewMail } = useNewMail();

    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0;
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0];
    const { data, isFetching, isPreviousData } = useGetAllJobApplicationsQuery({ jobId: id!, query, page: page, limit: limit });
    const openApplicantDetail = (candidateId: string) => {
        setSearchParams((prev) => {
            prev.set('candidateId', candidateId);
            return prev;
        });

    };
    return (
        <>
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    pb: 2,
                    borderBottom: '2px solid #f0f0f0'
                }}>
                    <Box sx={{
                        width: 4,
                        height: 28,
                        backgroundColor: '#E31E24',
                        borderRadius: 1
                    }} />
                    <Typography variant="h5" sx={{
                        fontWeight: 600,
                        color: '#1a1a1a',
                        fontSize: '1.5rem'
                    }}>
                        Kabul Edilen Bursiyerler
                    </Typography>
                </Box>
            </Box>
            <Card sx={{
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
                overflow: 'hidden'
            }}>
                <Paginate
                    isFetching={isFetching || isPreviousData}
                    pageSizes={pageSizes}
                    count={data?.count}
                >
                    {isFetching ? <div className='flex items-center justify-center p-8'><CircularProgress /> </div> :
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>ADAY</TableCell>
                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#666' }}>
                                        E-POSTA
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {data?.results?.length ?
                                    data?.results
                                        .map((application: any) => {
                                            return (
                                                <TableRow
                                                    key={application?._id}
                                                >
                                                    <TableCell>
                                                        <div onClick={() => openApplicantDetail(application?.candidateId?._id)} className="flex items-center gap-x-2">
                                                            <Avatar src={application.candidateId?.userId?.avatar}>
                                                                {application?.candidateId?.name?.[0]}
                                                                {application?.candidateId?.surname?.[0]}
                                                            </Avatar>
                                                            <Typography
                                                                sx={{ cursor: 'pointer' }}
                                                                variant="subtitle1"
                                                            >
                                                                {application?.candidateId?.name}{' '}
                                                                {application?.candidateId?.surname}
                                                            </Typography>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align='right' >
                                                        <div className='flex justify-center'>
                                                            <span className='cursor-pointer hover:underline  transition-all' onClick={() => {
                                                                openNewMail({
                                                                    initialTo: application?.candidateId?.email,
                                                                    lockToField: true,
                                                                })
                                                            }}>
                                                                {application?.candidateId?.email}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                </TableRow>
                                            );
                                        }) :
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Alert severity="warning">
                                                {t("noApplicantsOnboardingYet")}
                                            </Alert>
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    }
                </Paginate>
            </Card>
        </>
    )
}
Component.displayName = "Hired"
