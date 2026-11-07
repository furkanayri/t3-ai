import {
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { TenantPayload } from 'src/types/Tenant';
import { useTranslation } from "react-i18next";

export default function GeneralForm() {
  const { values, handleBlur, handleChange, errors, touched } =
    useFormikContext<TenantPayload>();

  const { t } = useTranslation();

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >

          <Grid
            item
          >
            <Stack spacing={3}>
              <Stack>
                <Typography variant="h6">{t('generalInfo')}</Typography>
                <Typography
                  mt={2}
                  color="text.secondary"
                  variant="body2"
                >
                  {t('generalInfoDescription')}
                </Typography>
              </Stack>
              <Stack>
                <TextField
                  fullWidth
                  label={t('companyName')}
                  name="name"
                  value={values.name ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  required
                />
              </Stack>
              <Stack>
                <TextField
                  fullWidth
                  label={t('legalName')}
                  name="legalName"
                  value={values.legalName ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.legalName && !!errors.legalName}
                  helperText={touched.legalName && errors.legalName}
                  required
                />
              </Stack>

              <Stack direction={{
                xs: 'column',
                sm: 'row',
              }} spacing={1}>
                <Stack flex={1}>
                  <TextField
                    fullWidth
                    label={t('email')}
                    name="email"
                    value={values.email ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    required
                  />
                </Stack>
                <Stack flex={1}>
                  <TextField
                    fullWidth
                    label={t('phone')}
                    name="phone"
                    value={values.phone ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    required
                  />
                </Stack>
              </Stack>
              <Stack>
                <TextField
                  fullWidth
                  label={t('Website')}
                  name="website"
                  value={values.website ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.website && !!errors.website}
                  helperText={touched.website && errors.website}
                  required
                />
              </Stack>

              <Stack direction={{
                xs: 'column',
                sm: 'row',
              }} spacing={1}>
                <Stack flex={1}>
                  <TextField
                    fullWidth
                    label={t('Country')}
                    name="country"
                    value={values.country ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.country && !!errors.country}
                    helperText={touched.country && errors.country}
                    required
                    select
                  >
                    <MenuItem
                      value="TR"
                    >
                      Türkiye
                    </MenuItem>
                    <MenuItem value="UK">
                      United Kingdom
                    </MenuItem>
                    <MenuItem value="FR">
                      France
                    </MenuItem>
                    <MenuItem
                      value="DE"
                    >
                      Deutchland
                    </MenuItem>
                    <MenuItem
                      value="USA"
                    >
                      United States
                    </MenuItem>
                  </TextField>
                </Stack>
                <Stack flex={1}>
                  <TextField
                    fullWidth
                    label={t('City')}
                    name="city"
                    value={values.city ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.city && !!errors.city}
                    helperText={touched.city && errors.city}
                    required
                  />
                </Stack>
              </Stack>
              <Stack>
                <TextField
                  fullWidth
                  rows={2}
                  multiline
                  label={t('address')}
                  name="address"
                  value={values.address ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.address && !!errors.address}
                  helperText={touched.address && errors.address}
                  required
                />
              </Stack>
              <Stack>
                <TextField
                  type="number"
                  label={t('companySize')}
                  name="companySize"
                  value={values.companySize ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.companySize && !!errors.companySize}
                  helperText={touched.companySize && errors.companySize}
                  required
                  select
                >
                  {
                    ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))
                  }
                </TextField>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
