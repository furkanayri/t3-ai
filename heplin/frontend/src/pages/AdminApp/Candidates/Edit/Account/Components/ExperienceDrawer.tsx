import React, { Dispatch, SetStateAction } from 'react';
import { Formik, useFormikContext } from 'formik';
import {
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Experience } from 'src/types/';
import { DatePicker } from '@mui/x-date-pickers';
import { Save as SaveIcon, Delete as DeleteIcon, Close } from '@mui/icons-material/';
import { useSnackbar } from 'notistack';
import {
  useDeleteCandidateExperienceMutation,
  usePostNewCandidateExperienceMutation,
  useUpdateCandidateExperienceMutation,
} from 'src/hooks/useServices';
import { locationTypes } from 'src/constants';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useCreateExperiencesMutation, useDeleteExperienceMutation, useUpdateExperiencesMutation } from 'src/hooks/useServices/admin';
import { useStaticCountries } from 'src/hooks/use-static-countries';
import { useStaticCities } from 'src/hooks/use-static-cities';
import { useSearchParams } from 'react-router-dom';

import {
  Autocomplete,
  CircularProgress,
} from '@mui/material';
interface IPropTypes {
  data: Experience;
  mode: 'create' | 'edit';
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  refetch: any;
}


const Drawer = ({ data, mode, setDrawerOpen, refetch }: IPropTypes) => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const updateExperienceMutation = useUpdateExperiencesMutation();
  const dynamicLanguage = i18n.language
  const postNewExperienceMutation = useCreateExperiencesMutation();
  const deleteExperienceMutation = useDeleteExperienceMutation();
  const countries = useStaticCountries();
  const countryCities = useStaticCities();
  const [searchParams, setSearchParams] = useSearchParams()

  const jobTypes = [
    { label: t('fulltime'), value: 'fulltime' },
    { label: t('parttime'), value: 'parttime' },
    { label: t('contract'), value: 'contract' },
    { label: t('temporary'), value: 'temporary' },
    { label: t('voluntary'), value: 'voluntarily' },
    { label: t('intern'), value: 'intern' },
    { label: t('other'), value: 'other' },
  ];
  const initialValues: Experience = {
    title: mode === 'edit' ? data?.title : '',
    company: mode === 'edit' ? data?.company : '',
    position: mode === 'edit' ? data?.position : '',
    jobType: mode === 'edit' ? data.jobType : '',
    country: mode === 'edit' ? data.country : {
      names: {
        en: '',
        tr: ''
      }
    },
    city: mode === 'edit' ? data.city : '',
    district: mode === 'edit' ? data.district : '',
    description: mode === 'edit' ? data.description : '',
    startDate: mode === 'edit' ? new Date(data.startDate) : new Date(),
    endDate: mode === 'edit' ? new Date(data.endDate) : new Date(),
    isOngoing: mode === 'edit' ? data.isOngoing : false,
    locationType: mode === 'edit' ? data.locationType : '',
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        if (mode === 'create') {
          postNewExperienceMutation.mutateAsync(

            { userId: id!, payload: { ...values } },
            {
              onSuccess: (data) => {
                enqueueSnackbar(t('Created new experience.'), { variant: 'success' });
                setDrawerOpen(false);
                refetch();
              },
              onError: (err) => {
                enqueueSnackbar((err as any).message, { variant: 'error' });
              },
            }
          );
        } else {
          updateExperienceMutation.mutateAsync(
            { userId: id ?? '', experiencesId: data?._id!, payload: { ...values } },
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
                {mode === 'create' ? t('New Experience') : t('Edit Experience')}
              </Typography>
              <Tooltip title={t("Cancel")}>
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack>
              <TextField
                label={t("Title")}
                name="title"
                onChange={handleChange}
                value={values.title ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("Job/Experience Title")}
                onBlur={handleBlur}
                error={touched.title && !!errors.title}
                helperText={touched.title && errors.title}
                required
              />
            </Stack>
            <Stack>
              <TextField
                label={t("Company")}
                name="company"
                onChange={handleChange}
                value={values.company ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("Nameofthecompany")}
                onBlur={handleBlur}
                error={touched.company && !!errors.company}
                helperText={touched.company && errors.company}
                required
              />
            </Stack>
            <Stack>
              <TextField
                label={t("Position")}
                name="position"
                onChange={handleChange}
                value={values.position ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("Position you worked at")}
                onBlur={handleBlur}
                error={touched.position && !!errors.position}
                helperText={touched.position && errors.position}
                required
              />
            </Stack>
            <Stack>
              <TextField
                fullWidth
                label={t("Job")}
                name="jobType"
                value={values.jobType ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.jobType && !!errors.jobType}
                helperText={touched.jobType && errors.jobType}
                select
                required
              >
                {jobTypes.map((type) => (
                  <MenuItem
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={2}
            >
              <DatePicker
                label={t("Start Date")}
                autoFocus={false}
                format="dd.MM.yyyy"
                slotProps={{ textField: { placeholder: t('Select start date') } }}
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
                  slotProps={{ textField: { placeholder: t('Select end date') } }}
                  disabled={false}
                  value={values.endDate ?? new Date()}
                  onChange={(e) => {
                    setFieldValue('endDate', e);
                  }}
                  sx={{ flexGrow: 1 }}
                />
              )}
            </Stack>
            <Stack>
              <TextField
                fullWidth
                label={t("Location Type")}
                name="locationType"
                value={values.locationType ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.locationType && !!errors.locationType}
                helperText={touched.locationType && errors.locationType}
                select
                required
              >
                {locationTypes.map((locationType) => (
                  <MenuItem
                    key={locationType.value}
                    value={locationType.value}
                  >
                    {t(locationType.label)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack
              direction={{
                xs: 'column',
              }}
              spacing={2}
            >
              <div className='w-full'>
                <Autocomplete
                  id="tags-standard"
                  value={
                    values?.country?.names
                      ? { _id: (values?.country as any)._id || '', names: values.country.names }
                      : null
                  }
                  options={countries}
                  getOptionLabel={(option: any) => {
                    return option?.names?.[dynamicLanguage] || option?.names?.en || '';
                  }}
                  filterSelectedOptions
                  loading={false}
                  noOptionsText={countries.length === 0 ? 'No countries' : 'No matching countries'}
                  loadingText={
                    <CircularProgress
                      color="inherit"
                      size={20}
                    />
                  }
                  onChange={(e, value: any) => {
                    setFieldValue('country', {
                      _id: value?._id || '',
                      names: value?.names || { en: '', tr: '' },
                    });
                    setSearchParams((prev: any) => {
                      prev.set('countryId', value._id)
                      return prev
                    })

                  }}
                  isOptionEqualToValue={(option: any, value: any) =>
                    option?._id === value?._id
                  }
                  renderInput={(params) => <TextField {...params} variant="standard" label={t('Country')} />}
                />
              </div>
            </Stack>
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={2}
            >
              {(values?.country?.names as { en: string })?.en === 'Turkey' && (
                <div className='w-full'>
                  <Autocomplete
                    options={countryCities}
                    isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
                    getOptionLabel={(option: any) => option.name || ''}
                    value={values.city ? { name: values.city } : null}
                    onChange={(e, value: any) => setFieldValue('city', value ? value.name : '')}
                    renderInput={(params) => <TextField {...params} label="City" />}
                  />
                </div>
              )}
              {(values?.country?.names as { en: string })?.en !== 'Turkey' && (
                <TextField
                  label={t('City')}
                  name="city"
                  value={values.city ?? ''}
                  onChange={(e) => {
                    setFieldValue('city', e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
                  }}
                  onBlur={handleBlur}
                  error={touched.city && !!errors.city}
                  // helperText={touched.city && errors.city}
                  sx={{ flexGrow: 1 }}
                />
              )}
              <TextField
                label={t("District")}
                name="district"
                onChange={handleChange}
                value={values.district ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("District")}
                onBlur={handleBlur}
                error={touched.district && !!errors.district}
                helperText={touched.district && errors.district}
                sx={{ flexGrow: 1 }}
                required
              />
            </Stack>
            <Stack>
              <TextField
                multiline
                rows={3}
                label={t("Description")}
                name="description"
                onChange={handleChange}
                value={values.description ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("Description of your job experience")}
                onBlur={handleBlur}
                error={touched.description && !!errors.description}
                helperText={touched.description && errors.description}
              />
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
                      deleteExperienceMutation.mutateAsync(
                        { experienceId: data?._id ?? '', userId: id! },
                        {
                          onSuccess: (data) => {
                            enqueueSnackbar(t('Experience deleted.'), { variant: 'info' });
                            refetch();
                            setDrawerOpen(false);
                          },
                          onError: (err) => {
                            enqueueSnackbar(
                              t('Unable to delete experience.') + (err as any).message,
                              { variant: 'error' }
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
