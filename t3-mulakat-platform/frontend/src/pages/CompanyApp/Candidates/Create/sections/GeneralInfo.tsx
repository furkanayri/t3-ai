import { Person, PersonOutline } from '@mui/icons-material';
import {
  Avatar,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Candidate } from 'src/types';

export default function GeneralInfo() {
  const { t } = useTranslation();
  const { values, handleBlur, handleChange, errors, touched } = useFormikContext<Candidate>();
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
            <Typography variant="h6">{t('generalInfo')}</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('defineTitleOfTheJob_selectDepartment')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <Stack spacing={3}>
              <Stack>
                <div className="">
                  <div className="px-4 py-2 border inline-flex items-center gap-x-2 rounded-lg">
                    <Avatar sx={{ width: 40, height: 40 }}>
                      <Person sx={{ color: grey[600] }} />
                    </Avatar>
                    <FormLabel>{t('addPhoto')}</FormLabel>
                  </div>
                </div>
              </Stack>
              <Stack>
                <TextField
                  required
                  label={t("Name")}
                  name="name"
                  value={values.name ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={{ flexGrow: 1 }}
                />
              </Stack>
              <Stack>
                <TextField
                  required
                  label={t("Surname")}
                  name="surname"
                  value={values.surname ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.surname && !!errors.surname}
                  helperText={touched.surname && errors.surname}
                  sx={{ flexGrow: 1 }}
                />
              </Stack>
              <Stack>
                <TextField
                  required
                  label={t("Email")}
                  name="email"
                  value={values.email ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  sx={{ flexGrow: 1 }}
                />
              </Stack>
              <Stack>
                <TextField
                  required
                  label={t("Phone")}
                  name="phone"
                  value={values.phone ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && !!errors.phone}
                  helperText={touched.phone && errors.phone}
                  sx={{ flexGrow: 1 }}
                />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
