import * as Yup from 'yup';
import { Formik } from 'formik';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import AuthLayout from '../../AuthLayout';
import { RegisterPayload } from 'src/types/user';
import { useAuth } from 'src/providers';
import { Alert, LoadingButton } from '@mui/lab';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Policies from '../Policies';

const initialValues: RegisterPayload = {
  email: '',
  name: '',
  surname: '',
  password: '',
  phone: '',
  isAcceptedTOS: false,
  isAcceptedKVKK: false,
};

export default function UserRegister() {
  const { t } = useTranslation();
  const { register, registerLoading, error } = useAuth();
  const [searchParams] = useSearchParams();

  const validationSchema = Yup.object({
    email: Yup.string().email(t('Must be a valid email')).max(255).required(t('Email is required')),
    phone: Yup.string().max(255).required(t('Phone is required')),
    surname: Yup.string().required(t('Surname is required')),
    name: Yup.string().max(255).required(t('Name is required')),
    password: Yup.string().min(7).max(255).required(t('Password is required')),
    policy: Yup.boolean().oneOf([true], t('This field must be checked')),
    isAcceptedTOS: Yup.boolean().oneOf([true], t('This field must be checked')),
    isAcceptedKVKK: Yup.boolean().oneOf([true], t('This field must be checked')),
  });


  const onSubmitHandler = (values: RegisterPayload) => {
    register({
      email: values.email,
      name: values.name,
      password: values.password,
      surname: values.surname,
      isAcceptedTOS: values.isAcceptedTOS,
      isAcceptedKVKK: values.isAcceptedKVKK,
      phone: values.phone
    });
  };

  const redirectParam = searchParams.get('redirect');


  return (
    <>
      <Seo title="Register" />
      <div>
        <Stack
          sx={{ mb: 4 }}
          spacing={1}
        >
          <Typography variant="h5">{t('Register')}</Typography>
          {error ? (
            <Alert
              severity="error"
              sx={{ my: 1 }}
            >
              {error}
            </Alert>
          ) : null}
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {t('Already have an account?')} &nbsp;
            <Link
              href={`/login${redirectParam ? `?redirect=${redirectParam}` : ''}`}
              component={RouterLink}
              underline="hover"
              variant="subtitle2"
            >
              {t('Log in')}
            </Link>
          </Typography>
        </Stack>
        <Formik
          onSubmit={onSubmitHandler}
          initialValues={initialValues}
          validationSchema={validationSchema}
        >
          {(formik) => {
            const handlePhoneChange = (event: any) => {
              const { value } = event.target;
              const isNumeric = /^[0-9]*$/;
              if (isNumeric.test(value)) {
                formik.setFieldValue('phone', value); // Telefon numarasını doğrudan güncelle
              }
            };
            return (
              <form
                noValidate
                onSubmit={formik.handleSubmit}
              >
                <Stack spacing={3}>
                  <TextField
                    error={!!(formik.touched.name && formik.errors.name)}
                    fullWidth
                    helperText={formik.touched.name && formik.errors.name}
                    label={t("Name")}
                    name="name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.name}
                  />
                  <TextField
                    error={!!(formik.touched.surname && formik.errors.surname)}
                    fullWidth
                    helperText={formik.touched.surname && formik.errors.surname}
                    label={t("Surname")}
                    name="surname"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.surname}
                  />
                  <TextField
                    error={!!(formik.touched.email && formik.errors.email)}
                    fullWidth
                    helperText={formik.touched.email && formik.errors.email}
                    label={t("Email Address")}
                    name="email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="email"
                    value={formik.values.email}
                  />
                  <TextField
                    error={!!(formik.touched.phone && formik.errors.phone)}
                    fullWidth
                    helperText={formik.touched.phone && formik.errors.phone}
                    label={t("Phone")}
                    name="phone"
                    onBlur={formik.handleBlur}
                    onChange={handlePhoneChange}
                    type="tel"
                    value={formik.values.phone}
                    inputProps={{ maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: 100 }}
                  />
                  <TextField
                    error={!!(formik.touched.password && formik.errors.password)}
                    fullWidth
                    helperText={formik.touched.password && formik.errors.password}
                    label={t("Password")}
                    name="password"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="password"
                    value={formik.values.password}
                  />
                </Stack>
                <Policies />
                <LoadingButton
                  loading={registerLoading}
                  fullWidth
                  size="large"
                  sx={{ mt: 3 }}
                  type="submit"
                  variant="contained"
                >
                  {t("Register")}
                </LoadingButton>
              </form>
            );
          }}
        </Formik>
      </div>
    </>

  );
};

