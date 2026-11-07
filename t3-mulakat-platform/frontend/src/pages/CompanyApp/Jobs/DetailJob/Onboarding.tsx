import {
    Alert,
    Avatar,
    Box,
    Card,
    CircularProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDisqualifyJobApplicationMutation, useGetAllJobApplicationsQuery } from 'src/hooks/useServices';
import { useDialog } from 'src/hooks/use-dialog';
import OnboardingDialog from './components/OnboardingDialog';
import { ArticleOutlined, DisabledByDefault } from '@mui/icons-material';
import { Paginate } from 'src/components/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNewMail } from 'src/providers';
import { OnboardingStatusChip, SalaryStatusChip } from './sections/OnboardingStatusChip';
import { DisqualifyApplicationDialog } from './sections';
import { enqueueSnackbar } from 'notistack';

interface DisqualifyData {
    applicationId: string;
    candidateId: string;
}
export function Component() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const { id } = useParams();
    const dialog = useDialog()
    const disqualify = useDialog<DisqualifyData>()

    const { openNewMail } = useNewMail();

    const pageSizes = [6, 12, 25];
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0;
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0];
    let query = 'status=onBoarding';

    const { data, isFetching, isPreviousData, refetch } = useGetAllJobApplicationsQuery({ jobId: id!, query, page, limit, });

    const openApplicantDetail = (candidateId: string) => {


        setSearchParams((prev) => {
            prev.set('candidateId', candidateId);
            return prev;
        });

    };
    const disqualifyMutation = useDisqualifyJobApplicationMutation();

    const handleSubmitDisqualify = async (disqualifyReason: string) => {
        const { applicationId, candidateId } = disqualify?.data!;
        const payload = {
            applicationId,
            candidateId,
            disqualifyReason,
        };

        return disqualifyMutation.mutateAsync(
            { jobId: id ?? '', payload },
            {
                onSuccess: (data) => {
                    enqueueSnackbar('Application disqualified', { variant: 'success' });
                    refetch();
                    disqualify.handleClose()
                },
                onError: (err: any) => {
                    enqueueSnackbar(err?.message, { variant: 'error' });
                },
            }
        );
    };

    return (
        <>
            <OnboardingDialog
                onClose={dialog.handleClose}
                open={dialog.open}
                data={dialog.data}
                refetch={refetch}
            />
            <DisqualifyApplicationDialog
                isOpen={disqualify.open}
                onClose={disqualify.handleClose}
                onSubmit={(reason) => handleSubmitDisqualify(reason)}
            />
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
                        Bursiyer Alımı
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
                                    <TableCell align='center' sx={{ fontWeight: 600, color: '#666' }}>
                                        DURUM
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>E-POSTA</TableCell>
                                    <TableCell align='center' sx={{ fontWeight: 600, color: '#666' }}>MAAŞ TEKLİFİ</TableCell>
                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#666' }}>İŞLEMLER</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {data?.results?.length ?
                                    data?.results
                                        .map((application: any) => {
                                            const lastAmountAndCurrency = application?.onboardingId?.amountAndCurrency?.length
                                                ? application?.onboardingId?.amountAndCurrency[application?.onboardingId?.amountAndCurrency?.length - 1]
                                                : null;



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
                                                            <OnboardingStatusChip status={application?.onboardingId?.status} />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='cursor-pointer hover:underline  transition-all' onClick={() => openNewMail({
                                                            initialTo: application?.candidateId?.email,
                                                            lockToField: true,
                                                        })}>
                                                            <span>{application?.candidateId?.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align='center'>
                                                        <SalaryStatusChip status={lastAmountAndCurrency?.status} />
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        {
                                                            application?.onboardingId &&
                                                            <Tooltip title={t("details")} >
                                                                <IconButton onClick={() => dialog.handleOpen({ onboardingId: application?.onboardingId?._id, applicantStatus: application?.status })}>
                                                                    <ArticleOutlined />
                                                                </IconButton>
                                                            </Tooltip>
                                                        }
                                                        <Tooltip title={t("disqualify")} >
                                                            <IconButton
                                                                onClick={() => disqualify.handleOpen({
                                                                    candidateId: application?.candidateId._id,
                                                                    applicationId: application._id
                                                                })}
                                                            >
                                                                <DisabledByDefault />
                                                            </IconButton>
                                                        </Tooltip>
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
            </Card >
        </>
    );
}

Component.displayName = 'Onboarding';
