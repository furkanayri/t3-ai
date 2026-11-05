import * as Yup from 'yup';
import { useFormik } from 'formik';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Seo } from 'src/components/seo';
import AuthLayout from '../AuthLayout';
import { useTranslation } from 'react-i18next';
import { useChangePassword } from 'src/hooks/useServices';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

interface Values {
  password: string;
  passwordConfirm: string;
}

export const Component = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const initialValues: Values = {
    password: '',
    passwordConfirm: '',
  };

  const changePasswordMutation = useChangePassword();

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      password: Yup.string().min(7, t('mustBeAtLeast7Characters')).max(255).required(t('Required')),
      passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password')], t('passwordsDoNotMatch'))
        .required(t('Required')),
    }),
    onSubmit: async (values) => {
      if (id && token) {
        try {
          await changePasswordMutation.mutateAsync({
            payload: {
              password: values.password,
              token,
              id,
            },
          });
          enqueueSnackbar(t('yourPasswordHasBeenReset'), { variant: 'success' });
          navigate('/login');
        } catch (error) {
          enqueueSnackbar(error?.message, { variant: 'error' });
        }
      } else {
        console.error('ID veya token bulunamadı');
      }
    },
  });

  return (
    <AuthLayout>
      <Seo title={t("reset_password")} />
      <div>
        <Stack sx={{ mb: 4 }} spacing={1}>
          <Typography variant="h5">{t("reset_password")}</Typography>
        </Stack>
        <form noValidate onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <TextField
              error={!!(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label={t('Password')}
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
            />
            <TextField
              error={!!(formik.touched.passwordConfirm && formik.errors.passwordConfirm)}
              fullWidth
              helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
              label={t("passwordConfirm")}
              name="passwordConfirm"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.passwordConfirm}
            />
          </Stack>
          <Button fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
            {t("Continue")}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

Component.displayName = 'ResetPassword';
