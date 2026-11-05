import React, { Dispatch, SetStateAction } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon, Close } from '@mui/icons-material/';
import { Education } from 'src/types/';
import { DatePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import {
  useDeleteCandidateEducationMutation,
  usePostNewCandidateEducationMutation,
  useUpdateCandidateEducationMutation,
} from 'src/hooks/useServices';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useCreateEducationMutation, useDeleteEducationMutation, useUpdateEducationMutation } from 'src/hooks/useServices/admin';
import { useParams } from 'react-router';

interface IPropTypes {
  data: Education;
  mode: 'create' | 'edit';
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  refetch: any;
}
const Drawer = ({ data, mode, setDrawerOpen, refetch }: IPropTypes) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams()

  const postNewEducationMutation = useCreateEducationMutation();
  const updateEducationMutation = useUpdateEducationMutation(); //new
  const deleteEducationMutation = useDeleteEducationMutation();

  const initialValues: Education = {
    institution: mode === 'edit' ? data.institution : '',
    degree: mode === 'edit' ? data.degree : '',
    major: mode === 'edit' ? data.major : '',
    startDate: mode === 'edit' ? new Date(data.startDate) : new Date(),
    endDate: mode === 'edit' ? new Date(data.endDate) : new Date(),
    isOngoing: mode === 'edit' ? data.isOngoing : false,
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        if (mode === 'create') {
          postNewEducationMutation.mutateAsync(
            { userId: id!, payload: { ...values } },
            {
              onSuccess: (data) => {
                enqueueSnackbar(t('Created new education.'), { variant: 'success' });
                setDrawerOpen(false);
                refetch();
              },
              onError: (err) => {
                enqueueSnackbar((err as any).message, { variant: 'error' });
              },
            }
          );
        } else {
          updateEducationMutation.mutateAsync(
            { userId: id!, educationId: data._id!, payload: { ...values } },
            {
              onSuccess: (data) => {
                enqueueSnackbar(t('Experience updated.'), { variant: 'success' });
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
                {mode === 'create' ? t('New Education') : t('Edit Education')}
              </Typography>
              <Tooltip title="Cancel">
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack>
              <TextField
                label={t("Institution")}
                name="institution"
                onChange={handleChange}
                value={values.institution ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("Institution")}
                onBlur={handleBlur}
                error={touched.institution && !!errors.institution}
                helperText={touched.institution && errors.institution}
                required
              />
            </Stack>
            <Stack>
              <TextField
                label={t("Degree")}
                name="degree"
                onChange={handleChange}
                value={values.degree ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("Degree")}
                onBlur={handleBlur}
                error={touched.degree && !!errors.degree}
                helperText={touched.degree && errors.degree}
                required
              />
            </Stack>
            <Stack>
              <TextField
                label={t("Major")}
                name="major"
                onChange={handleChange}
                value={values.major ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("Major")}
                onBlur={handleBlur}
                error={touched.major && !!errors.major}
                helperText={touched.major && errors.major}
                required
              />
            </Stack>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
            >
              <DatePicker
                label={t("Start Date")}
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
              {!values.isOngoing && (
                <DatePicker
                  label={t("End Date")}
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
              )}
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
            >
              <Typography variant="body2">{t('Is this experience still ongoing?')}</Typography>
              <Checkbox
                color="default"
                sx={{ ml: 2 }}
                defaultChecked={initialValues.isOngoing}
                onChange={(e) => {
                  setFieldValue('isOngoing', e.target.checked);
                }}
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
                      deleteEducationMutation.mutateAsync(
                        { educationId: data?._id ?? '', userId: id!, },
                        {
                          onSuccess: (data: any) => {
                            enqueueSnackbar(t('Education deleted.'), { variant: 'info' });
                            refetch();
                            setDrawerOpen(false);
                          },
                          onError: (err: any) => {
                            enqueueSnackbar(t('Unable to delete education.') + (err as any).message, {
                              variant: 'error',
                            });
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
