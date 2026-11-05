import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, TextField } from '@mui/material'
import { useFormik } from 'formik';
import { enqueueSnackbar } from 'notistack';
import { status } from 'nprogress';
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useUpdateMyOnboardingMutation } from 'src/hooks/useServices';
import { AmountAndCurrency, CandidateOnboardingPayload } from 'src/types/CandidateOnboarding';


function AcceptJobDialog({ onClose, open, priceOffer, refetch }: { onClose: () => void, open: boolean, priceOffer: any, refetch: () => void }) {
    const updateMyOnboardingMutation = useUpdateMyOnboardingMutation();
    const { onboardingId } = useParams()
    const { t } = useTranslation()


    const { values, setFieldValue, handleChange, handleSubmit } = useFormik<any>({
        initialValues: {
            reason: '',
            status: '',
            amountAndCurrency: {
                status: '',
            }
        },
        onSubmit: (value) => {
            const updatedAmountAndCurrency = [
                ...(priceOffer || []),
                {
                    currency: priceOffer?.[priceOffer?.length - 1]?.currency,
                    amount: priceOffer?.[priceOffer?.length - 1]?.amount,
                    status: values?.amountAndCurrency?.status,
                    ...(values?.amountAndCurrency?.status === 'reject' && { reason: values?.reason })
                }
            ];

            const payload = {
                ...values,
                amountAndCurrency: updatedAmountAndCurrency
            };
            updateMyOnboardingMutation.mutate({ id: onboardingId ?? "", payload: payload }, {
                onSuccess: () => {
                    enqueueSnackbar('Onboarding updated successfully', { variant: 'success' });
                    refetch()
                },
                onError: () => {
                    enqueueSnackbar('Failed to update onboarding', { variant: 'error' });
                }
            })
        }
    })

    return (
        <Dialog
            fullWidth
            maxWidth={'sm'}
            open={open}
            PaperProps={{
                sx: {
                    width: 600,
                    margin: 'auto',
                },
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>{t('Onboarding')}</DialogTitle>
                <DialogContent>
                    <div className='flex flex-col gap-2 '>
                        <div>
                            <FormControl>
                                <FormLabel id="job">{t('recruitmentProcess')}</FormLabel>
                                <RadioGroup
                                    onChange={handleChange}
                                    row
                                    value={values.status}
                                    aria-labelledby="job"
                                    name="status"
                                >
                                    <FormControlLabel value="offerAccepted" control={<Radio />} label={t('Yes')} />
                                    <FormControlLabel value="cancelled" control={<Radio />} label={t('No')} />
                                </RadioGroup>
                            </FormControl>
                        </div>

                        {
                            values.status === 'offerAccepted' &&
                            <div >

                                <FormControl>
                                    <FormLabel id="amount"><span className='font-bold'>{`${priceOffer[priceOffer?.length - 1]?.amount} ${priceOffer[priceOffer?.length - 1]?.currency}`}</span> {t('isSalaryOfferAccepted')}</FormLabel>
                                    <RadioGroup
                                        onChange={handleChange}
                                        row
                                        value={values?.amountAndCurrency?.status || ''}
                                        aria-labelledby="amount"
                                        name="amountAndCurrency.status"
                                    >
                                        <FormControlLabel value="accepted" control={<Radio />} label={t('Yes')} />
                                        <FormControlLabel value="reject" control={<Radio />} label={t('No')} />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        }
                        {
                            (values?.status === 'cancelled' || values?.amountAndCurrency?.status === 'reject') &&
                            <div>
                                <TextField
                                    label={t('Description')}
                                    variant="outlined"
                                    name="reason"
                                    multiline
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder={t('Add description')}
                                    fullWidth
                                />
                            </div>
                        }
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button type='submit' variant='outlined'>
                        {t('send')}
                    </Button>
                </DialogActions>
            </form>

        </Dialog>
    )
}

export default AcceptJobDialog