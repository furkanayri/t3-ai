import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import { useGetTenantInfoQuery, useTenantQrMutation, useUpdateTenantInfoMutation } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';
import { companyValidationSchema } from 'src/validations';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ProtectedRoute } from 'src/components/Permission';
import { convertPublicFileURL } from 'src/utils';
import { HeplinLogo } from 'src/icons';
import { CustomButton } from 'src/components/shared';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import QrSection from './components/QrSection';

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

export default function CompanySettings() {
  const { t } = useTranslation();
  const { activeTenantId } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const tenantInfoQuery = useGetTenantInfoQuery({ tenantId: activeTenantId ?? '' });
  const [qr, setQr] = useState('')
  const updateTenantInfo = useUpdateTenantInfoMutation();
  const tenantInfo = tenantInfoQuery?.data?.tenant


  const initialValues = model(tenantInfo);
  const { values, handleChange, handleBlur, errors, touched, handleSubmit } =
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
    <ProtectedRoute permission="company_settings">
      <div className='flex w-full gap-4'>
        <div className="w-full max-w-4xl pt-12">
          <p className="text-[20px] text-[#5E5E5E]  font-medium mb-3">{t('companyProfile')}</p>
          <form
            className='px-[40px] py-[48px] flex gap-4'
            onSubmit={handleSubmit}
            style={{
              boxShadow: '0px 4px 14.8px 0px #A6A6A640'
            }}
          >
            <div>
              <div className='w-[112px] h-[112px] flex justify-center items-center border-[1px] border-[#EFEFEF]'>
                {!!tenantInfo?.logo ?
                  <Avatar
                    sx={{ width: 75, height: 75 }}
                    src={convertPublicFileURL(tenantInfo?.logo)}
                  />
                  :
                  <HeplinLogo />
                }
              </div>
              <p className="text-xs text-[#5E5E5E] text-center mb-1">{t('companyLogo')}</p>
            </div>


            <div className='flex flex-col w-full gap-[16px]'>
              <p className='font-medium text-[15px] leading-5 text-[#5E5E5E]'>{t('generalInformation')}</p>
              <TextField
                name="name"
                value={values.name ?? ''}
                variant='outlined'
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name?.toString()}
                label={t('companyName')}
                inputProps={{
                  maxLength: 50,
                }}
              />
              <TextField
                name="legalName"
                value={values.legalName ?? ''}
                variant='outlined'
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.legalName && !!errors.legalName}
                helperText={touched.legalName && errors.legalName?.toString()}
                label={t('legalName')}
              />
              <p className='font-medium text-[15px] leading-5 text-[#5E5E5E] mt-[30px]'>{t('contactInformation')}</p>
              <div className='flex gap-[10px]'>
                <TextField
                  name="phone"
                  value={values.phone ?? ''}
                  variant='outlined'
                  onChange={handlePhoneChange}
                  onBlur={handleBlur}
                  error={touched.phone && !!errors.phone}
                  helperText={touched.phone && errors.phone?.toString()}
                  inputProps={{ maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: 100 }}
                  label={t('phone')}
                />
                <TextField
                  name="email"
                  value={values.email ?? ''}
                  variant='outlined'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email?.toString()}
                  fullWidth
                  label={t('email')}
                />
              </div>
              <TextField
                name="address"
                value={values.address ?? ''}
                variant='outlined'
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.address && !!errors.address}
                helperText={touched.address && errors.address?.toString()}
                label={t('address')}
              />
              <TextField
                name="website"
                value={values.website ?? ''}
                variant='outlined'
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.website && !!errors.website}
                helperText={touched.website && errors.website?.toString()}
                label={t('Website')}
              />
              <div className='flex justify-end items-center mt-[20px] capitalize'>
                <CustomButton
                  style={{ fontWeight: 500 }}
                  type='submit'
                >
                  {t('saveChanges')}
                </CustomButton>
              </div>
            </div>
          </form>
        </div>
        <QrSection
          refetch={tenantInfoQuery.refetch}
          tenantInfo={tenantInfo} />

      </div>
    </ProtectedRoute >

  );
}
