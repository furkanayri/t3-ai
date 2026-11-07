import { Autocomplete, Card, CardContent, CircularProgress, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import type { JobForm } from 'src/types/jobPost';
import { useStaticCountries } from 'src/hooks/use-static-countries';
import { useStaticCities } from 'src/hooks/use-static-cities';
const locationTypes = [
  {
    label: 'On-site',
    value: 'onsite',
  },
  {
    label: 'Hybrid',
    value: 'hybrid',
  },
  {
    label: 'Remote',
    value: 'remote',
  },
];
export default function GeneralForm() {
  const countries = useStaticCountries();
  const countryCities = useStaticCities();
  const { t, i18n } = useTranslation();
  const { values, handleBlur, handleChange, errors, touched, setFieldValue, setValues } = useFormikContext<JobForm>();
  const [searchParams, setSearchParams] = useSearchParams()
  const countryId = useMemo(() => searchParams.get('countryId'), [searchParams])
  const dynamicLanguage = i18n.language

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography variant="h6">{t('location')}</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('Define_title_of_the_job_select_department_and_add_some_tags_for_easy_management')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <Stack spacing={3}>
              <Stack>
                <TextField
                  fullWidth
                  label={t('Location Type')}
                  name="locationType"
                  value={values.locationType ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.locationType && !!errors.locationType}
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
              <Stack flexGrow={1}>
                <div className="w-full">
                  <Autocomplete
                    id="country-autocomplete"
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
                    noOptionsText={countries.length === 0 ? 'No countries' : 'No matching countries'}
                    loadingText={<CircularProgress color="inherit" size={20} />}
                    onChange={(e, value: any) => {
                      setFieldValue('country', {
                        _id: value?._id || '',
                        names: value?.names || { en: '', tr: '' },
                      });
                      setSearchParams((prev: any) => {
                        prev.set('countryId', value?._id);
                        return prev;
                      });
                    }}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option?._id === value?._id
                    }
                    renderInput={(params) => <TextField {...params} variant="standard" label={t('Country')} />}
                  />
                </div>
              </Stack>


              <Stack direction="row" alignItems="center" spacing={3}>
                {(values?.country?.names as { en: string })?.en === 'Turkey' && (
                  <Stack flexGrow={1}>
                    <div className="w-full">
                      <Autocomplete
                        id="city-autocomplete"
                        options={countryCities}
                        isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
                        getOptionLabel={(option: any) => option.name || ''}
                        value={values.city ? { name: values.city } : null}
                        onChange={(e, value: any) => setFieldValue('city', value ? value.name : '')}
                        renderInput={(params) => <TextField {...params} label="City" />}
                      />
                    </div>
                  </Stack>
                )}
                {(values?.country?.names as { en: string })?.en !== 'Turkey' && (
                  <Stack flexGrow={1}>
                    <TextField
                      label={t('City')}
                      name="city"
                      value={values.city ?? ''}
                      onChange={(e) => {
                        setFieldValue('city', e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
                      }}
                      onBlur={handleBlur}
                      error={touched.city && !!errors.city}
                      helperText={touched.city && errors.city}
                      sx={{ flexGrow: 1 }}
                    />
                  </Stack>
                )}
                <Stack flexGrow={1}>
                  <TextField
                    label={t('District')}
                    name="district"
                    value={values.district ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.district && !!errors.district}
                    helperText={touched.district && errors.district}
                    sx={{ flexGrow: 1 }}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
