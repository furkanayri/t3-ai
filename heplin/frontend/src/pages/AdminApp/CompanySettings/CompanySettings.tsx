import React from 'react'
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import {
    Alert,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    TextField,
    Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Container from '@mui/material/Container';

import { useGetTenantInfoQuery, useUpdateTenantInfoMutation } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';
import { companyValidationSchema } from 'src/validations';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/system';
const model = (data: any) => {
    return {
        name: data?.name ?? '',
        legalName: data?.legalName ?? '',
        email: data?.email ?? '',
        phone: data?.phone ?? '',
        address: data?.address ?? '',
        website: data?.website ?? '',
        description: data?.description ?? ''
    };
};
export function Component() {
    const { t } = useTranslation();
    const { activeTenantId } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const tenantInfoQuery = useGetTenantInfoQuery({ tenantId: activeTenantId ?? '' });

    const updateTenantInfo = useUpdateTenantInfoMutation();
    const tenantInfo = tenantInfoQuery?.data?.tenant

    const initialValues = model(tenantInfo);
    const { values, handleChange, handleBlur, errors, touched, isSubmitting, handleSubmit } =
        useFormik({
            initialValues,
            enableReinitialize: true,
            validationSchema: companyValidationSchema,
            onSubmit: (values, helpers) => {
                updateTenantInfo.mutate(
                    { id: tenantInfo?._id, payload: values },
                    {
                        onSuccess: (res) => {
                            helpers.setSubmitting(false);
                            tenantInfoQuery.refetch();
                            enqueueSnackbar(t('The company info was updated successfully'));
                        },
                        onError: (err) => {
                            helpers.setSubmitting(false);
                            enqueueSnackbar((err as any).message, {
                                variant: 'error',
                            });
                        },
                    }
                );
            },
        });

    if (tenantInfoQuery.isLoading) return <CircularProgress />;

    if (tenantInfoQuery.isError)
        return <Alert severity="error"> {(tenantInfoQuery.error as any)?.message}</Alert>;

    if (!tenantInfo)
        return <Alert severity="warning">{t('companyInfoNotFoundPleaseContact')}</Alert>;
    const handlePhoneChange = (event: any) => {
        const { value } = event.target;
        const isNumeric = /^[0-9]*$/;
        if (isNumeric.test(value)) {
            handleChange(event);
        }
    };
    return (
        <div className='pr-[55px] w-full max-w-5xl'>
            <header className='pb-[30px]'>
                <p className='font-satoshi font-medium text-[24px]  z-50'>
                    {t('Company Settings')}
                </p>
            </header>
            <div className='p-[22px] rounded-[13px]'
                style={{
                    boxShadow: "0px 4px 14.8px 0px #A6A6A640"
                }}
            >
                <div>
                    <p className="text-[20px] text-[#5E5E5E] font-medium mb-3 ml-3">{t('profile')}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-4 mb-2'>
                        <div className='w-full flex gap-2 '>
                            <div>
                                <TextField
                                    name="name"
                                    value={values.name ?? ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.name && !!errors.name}
                                    helperText={touched.name && errors.name?.toString()}
                                    fullWidth
                                    label={t('companyName')}
                                    inputProps={{ maxLength: 50 }}
                                />
                            </div>
                            <div>
                                <TextField
                                    name="legalName"
                                    value={values.legalName ?? ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.legalName && !!errors.legalName}
                                    helperText={touched.legalName && errors.legalName?.toString()}
                                    fullWidth
                                    label={t('legalName')}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-y-4 gap-x-4">
                            <div>
                                <TextField
                                    name="email"
                                    value={values.email ?? ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.email && !!errors.email}
                                    helperText={touched.email && errors.email?.toString()}
                                    fullWidth
                                    label={t('email')}
                                />
                            </div>
                            <div>
                                <TextField
                                    name="phone"
                                    value={values.phone ?? ''}
                                    onChange={handlePhoneChange} // Özel handleChange fonksiyonunuzu burada kullanın
                                    onBlur={handleBlur}
                                    error={touched.phone && !!errors.phone}
                                    helperText={touched.phone && errors.phone?.toString()}
                                    fullWidth
                                    inputProps={{ maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: 100 }}
                                    label={t('phone')}
                                />

                            </div>
                            <div>
                                <TextField
                                    name="website"
                                    value={values.website ?? ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.website && !!errors.website}
                                    helperText={touched.website && errors.website?.toString()}
                                    fullWidth
                                    label={t('Website')}
                                />
                            </div>
                        </div>
                        <div>
                            <TextField
                                name="address"
                                value={values.address ?? ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.address && !!errors.address}
                                helperText={touched.address && errors.address?.toString()}
                                label={t('address')}
                                multiline
                                fullWidth
                                minRows={2}
                            />
                        </div>
                        <div>
                            <TextField
                                name="description"
                                value={values.description ?? ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.description && !!errors.description}
                                helperText={touched.description && errors.description?.toString()}
                                label={t('description')}
                                multiline
                                fullWidth
                                minRows={2}
                            />
                        </div>
                    </div>
                    <CardActions className="flex items-center justify-end">
                        <LoadingButton
                            loading={isSubmitting}
                            type="submit"
                            variant="contained"
                        >
                            {t('saveChanges')}
                        </LoadingButton>
                    </CardActions>
                </form>
            </div>
        </div>
    )
}

Component.displayName = 'CompanySettings';
