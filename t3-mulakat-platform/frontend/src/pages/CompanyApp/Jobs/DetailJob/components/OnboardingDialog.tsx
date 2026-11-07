import { Accordion, AccordionDetails, AccordionSummary, Avatar, Button, Card, CardContent, CircularProgress, Dialog, Divider, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { DownloadFileButton } from 'src/components';
import { useGetMyEmployeeDataQuery, useGetOneCandidateOnboardingQuery, useUpdateApplicant, useUpdateMyOnboardingMutation } from 'src/hooks/useServices';
import { SalaryStatusChip } from '../sections/OnboardingStatusChip';
import { ArrowExpandDiagonal01Icon } from 'hugeicons-react';
import { AmountAndCurrency, CandidateOnboardingPayload } from 'src/types/CandidateOnboarding';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useAuth } from 'src/providers';
interface OnboardingDialogProps {
    onClose: () => void;
    open?: boolean;
    data: any;
    refetch: () => void
}
const OnboardingDialog = ({ onClose, open = false, data, refetch }: OnboardingDialogProps) => {
    const { t } = useTranslation()
    const onBoardingQuery = useGetOneCandidateOnboardingQuery({ id: data?.onboardingId });
    const onBoarding = onBoardingQuery?.data?.candidateOnboarding;
    const onBoardingWorkflow = onBoarding?.onboardingWorkflowId?.items
    const employeeDataQuery = useGetMyEmployeeDataQuery();
    const employee = employeeDataQuery?.data?.employee;
    const applicantMutation = useUpdateApplicant()
    const { id } = useParams()


    const handleHireCandidate = () => {
        const payload = {
            status: 'hired',
            candidateId: onBoarding?.candidateId?._id,
        }
        applicantMutation.mutateAsync({
            jobId: id ?? '',
            payload: payload
        }, {
            onSuccess() {
                enqueueSnackbar({
                    message: t('Candidatehiredsuccess'),
                    variant: "success"
                })
                refetch()
                onClose()
            },
            onError(error: any) {
                enqueueSnackbar({
                    message: error.message,
                    variant: "error"
                })
            },
        })
    }

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            onClose={onClose}
            open={open}
        >
            {
                onBoardingQuery.isLoading ? <div className='flex items-center justify-center'><CircularProgress /> </div> :
                    <div className='px-6 py-8'>
                        {employee?.type !== 'staff' &&
                            <OnboaringStatusAndReason
                                refetch={refetch}
                                onBoarding={onBoarding} />
                        }

                        <div className='flex items-center gap-4 mb-4'>
                            <Avatar src={onBoarding?.candidateId?.userId?.avatar} sx={{ width: 54, height: 54 }}>

                            </Avatar>
                            <div>
                                <Typography variant='h5'>
                                    {onBoarding?.candidateId?.name} {' '}
                                    {onBoarding?.candidateId?.surname}
                                </Typography>
                                <Typography variant='body1'>
                                    {onBoarding?.candidateId?.email}
                                </Typography>
                            </div>
                        </div>

                        <div className='flex flex-col gap-4 mt-8'>
                            {onBoardingWorkflow?.map((item: any, index: number) => {
                                const foundResponse = onBoarding?.responses?.find((response: any) => response?.itemId === item?._id);
                                return (
                                    <div key={item._id} className='border-gray-400 pb-2'>
                                        <Typography variant='h6'>{index + 1}. {item?.title}</Typography>
                                        <Typography variant='subtitle2'>{item?.description}</Typography>
                                        {foundResponse && (
                                            <div className='flex items-center mt-2'>
                                                <p className='pr-2'>-</p>
                                                {foundResponse?.type === 'file' ? (
                                                    <>
                                                        <p>{t("file")}:</p>
                                                        <DownloadFileButton fileKey={foundResponse?.response} />
                                                    </>
                                                ) : (
                                                    <Typography variant='body1'> {foundResponse?.response}</Typography>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                            }
                        </div>
                        <div className='flex justify-end'>
                            <Tooltip title={t('hiringCandidate')}>
                                <Button
                                    disabled={data?.applicantStatus === 'hired'}
                                    onClick={handleHireCandidate}
                                    style={{
                                        backgroundColor: '#10b981'
                                    }} variant='contained'>
                                    {applicantMutation.isLoading ?
                                        <CircularProgress size={'18px'} color='secondary' />
                                        :
                                        data?.applicantStatus === 'hired' ? t('Hired') : t('hire')
                                    }
                                </Button>
                            </Tooltip>
                        </div>

                    </div>
            }
        </Dialog>
    )
}

export default OnboardingDialog

function OnboaringStatusAndReason({ onBoarding, refetch }: { onBoarding: any, refetch: () => void }) {
    const { t } = useTranslation()
    const [latestAmount, setLatesAmount] = useState(0)
    const [latestCurrency, setLatestCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY')
    const amountAndCurrencyData = onBoarding?.jobApplicationId?.onboardingId
    const onBoardingMutation = useUpdateMyOnboardingMutation()
    const { enqueueSnackbar } = useSnackbar();
    const { id } = useParams()
    const { activeTenant } = useAuth()


    const handleClick = () => {
        const updatedAmountAndCurrency = [
            ...(onBoarding?.amountAndCurrency || []),
            {
                amount: latestAmount,
                currency: latestCurrency,
                status: 'pending'
            }

        ];
        const payload: Partial<CandidateOnboardingPayload> = {
            status: 'pending',
            amountAndCurrency: updatedAmountAndCurrency,
            tenantId: activeTenant?._id,
            jobId: id,
            candidateId: onBoarding?.candidateId?._id
        }
        onBoardingMutation.mutateAsync({
            id: onBoarding?._id,
            payload,
            query: 'offeragain=true'
        }, {
            onSuccess(data, variables, context) {
                enqueueSnackbar('Teklif gönderildi', { variant: 'success' });
                refetch()
            },
            onError(error, variables, context) {
                enqueueSnackbar('Tekrar Teklif Gönderirken hata', { variant: 'error' });
            },
        }
        )
    }


    return (
        <>
            {amountAndCurrencyData?.amountAndCurrency?.length > 0 &&
                <div className="my-8">
                    {
                        amountAndCurrencyData?.amountAndCurrency?.map((item: any, index: number) => {
                            return (
                                <div key={index}>
                                    <div  >
                                        <div className='flex justify-between items-center '>
                                            <Typography variant="h6" className="font-semibold">
                                                {index + 1}. {t('offeredAmount')}
                                            </Typography>
                                            <SalaryStatusChip status={item.status} />
                                        </div>
                                        <Typography variant="body2" className="font-bold">
                                            {item?.amount} {item.currency}
                                        </Typography>
                                        {item?.status === 'reject' && item?.reason && (
                                            <Typography variant="body2" className="font-bold">
                                                <span style={{ color: '#e02d2d' }}>{t('reasonforRejection')}:</span> {item?.reason}
                                            </Typography>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    }
                    <div className='my-2'>
                        <Divider />
                    </div>
                    {
                        amountAndCurrencyData?.amountAndCurrency[amountAndCurrencyData?.amountAndCurrency?.length - 1]?.status === 'reject' &&
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ArrowExpandDiagonal01Icon />}
                            >
                                <Typography>{t('sendOfferAgain')}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className='flex items-center  gap-2'>
                                    <TextField
                                        type="number"
                                        label={'Maaş'}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLatesAmount(Number(e.target.value))}
                                        value={latestAmount}
                                        fullWidth
                                    />
                                    <Select
                                        name="currency"
                                        value={latestCurrency}
                                        onChange={(e) => setLatestCurrency(e.target.value as 'USD' | 'EUR' | 'TRY')}
                                        sx={{ width: '160px' }}
                                        size={'medium'}
                                    >
                                        {[
                                            { code: 'USD', symbolText: '$' },
                                            { code: 'EUR', symbolText: '€' },
                                            { code: 'TRY', symbolText: '₺' },
                                        ].map((formType) => (
                                            <MenuItem
                                                value={formType.code}
                                                key={formType.code}
                                            >
                                                {formType.code} ({formType.symbolText})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Button onClick={() => handleClick()} variant='contained'>{t('send')}</Button>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    }
                </div>
            }
        </>
    )
}
