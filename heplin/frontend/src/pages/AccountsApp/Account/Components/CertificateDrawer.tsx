import React, { Dispatch, SetStateAction } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon, Close } from '@mui/icons-material/';
import { DatePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import {
  useDeleteCandidateCertificateMutation,
  usePostNewCandidateCertificateMutation,
  useUpdateCandidateCertificateMutation,
} from 'src/hooks/useServices';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Certificate } from 'src/types/Certificate';
import CertificateFilesUpload from './certificateFiles/CertificateFiles';

interface IPropTypes {
  data: Certificate;
  mode: 'create' | 'edit';
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  refetch: any;
}
const Drawer = ({ data, mode, setDrawerOpen, refetch }: IPropTypes) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const postNewCertificateMutation = usePostNewCandidateCertificateMutation();
  const updateCertificateMutation = useUpdateCandidateCertificateMutation();
  const deleteCertificateMutation = useDeleteCandidateCertificateMutation();

  const initialValues: Certificate = {
    institution: mode === 'edit' ? data.institution : '',
    degree: mode === 'edit' ? data.degree : '',
    startDate: mode === 'edit' ? new Date(data.startDate) : new Date(),
    endDate: mode === 'edit' ? new Date(data.endDate) : new Date(),
    files: Array.isArray(data.files) ? data.files : []
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={(values) => {
        if (mode === 'create') {
          postNewCertificateMutation.mutateAsync(
            { ...values },
            {
              onSuccess: (data) => {
                enqueueSnackbar(t('Created new certificate.'), { variant: 'success' });
                setDrawerOpen(false);
                refetch();
              },
              onError: (err) => {
                enqueueSnackbar((err as any).message, { variant: 'error' });
              },
            }
          );
        } else {
          updateCertificateMutation.mutateAsync(
            { id: data?._id ?? '', payload: { ...values } },
            {
              onSuccess: (data) => {
                enqueueSnackbar(t('Certificate updated.'), { variant: 'success' });
                setDrawerOpen(false);
                refetch();
              },
              onError: (err) => {
                enqueueSnackbar((err as any).message, { variant: 'error' });
              },
            }
          );
        }
      }}
    >
      {({ handleSubmit, values, handleBlur, handleChange, setFieldValue, errors, touched }) => (
        <form onSubmit={handleSubmit}>
          <Stack
            spacing={3}
            sx={{ mb: 3, p: { xs: 4, md: 6 } }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="h6">
                {mode === 'create' ? t('New Certificate') : t('Edit Certificate')}
              </Typography>
              <Tooltip title="Cancel">
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack>
              <TextField
                label={t('Institution')}
                name="institution"
                onChange={handleChange}
                value={values.institution ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t('Institution')}
                onBlur={handleBlur}
                error={touched.institution && !!errors.institution}
                helperText={touched.institution && errors.institution}
                required
              />
            </Stack>
            <Stack>
              <TextField
                label={t('Degree')}
                name="degree"
                onChange={handleChange}
                value={values.degree ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t('Degree')}
                onBlur={handleBlur}
                error={touched.degree && !!errors.degree}
                helperText={touched.degree && errors.degree}
                required
              />
            </Stack>

            <Stack>
              <Card>
                <CertificateFilesUpload />
              </Card>
            </Stack>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
            >
              <DatePicker
                label={t('Start Date')}
                autoFocus={false}
                format="dd.MM.yyyy"
                slotProps={{ textField: { placeholder: 'Select start date' } }}
                disabled={false}
                value={values.startDate ?? new Date()}
                onChange={(e) => {
                  setFieldValue('startDate', e);
                }}
                sx={{ flexGrow: 1 }}
              />

              <DatePicker
                label={t('End Date')}
                autoFocus={false}
                format="dd.MM.yyyy"
                slotProps={{ textField: { placeholder: 'Select end date' } }}
                disabled={false}
                value={values.endDate ?? new Date()}
                onChange={(e) => {
                  setFieldValue('endDate', e);
                }}
                sx={{ flexGrow: 1 }}
              />
            </Stack>

            <Stack
              justifyContent="flex-start"
              alignItems="center"
              spacing={1}
            >
              <Stack
                direction="row"
                spacing={2}
                color="grey"
              >
                <Button
                  fullWidth
                  color={mode === 'edit' ? 'error' : 'inherit'}
                  onClick={() => {
                    if (mode === 'edit') {
                      deleteCertificateMutation.mutateAsync(
                        { id: data?._id ?? '' },
                        {
                          onSuccess: (data) => {
                            enqueueSnackbar(t('Certificate deleted.'), { variant: 'info' });
                            refetch();
                            setDrawerOpen(false);
                          },
                          onError: (err) => {
                            enqueueSnackbar(
                              t('Unable to delete certificate.') + (err as any).message,
                              {
                                variant: 'error',
                              }
                            );
                          },
                        }
                      );
                    } else {
                      setDrawerOpen(false);
                    }
                  }}
                >
                  {mode === 'edit' ? t('Delete') : t('Cancel')}
                </Button>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                >
                  {t('Save')}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      )}
    </Formik>
  );
};

export default Drawer;
