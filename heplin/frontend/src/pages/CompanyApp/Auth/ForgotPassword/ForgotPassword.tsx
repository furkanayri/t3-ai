import * as Yup from 'yup';
import { useFormik } from 'formik';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Seo } from 'src/components/seo';
import AuthLayout from '../AuthLayout';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useForgotPassword } from 'src/hooks/useServices';
import { enqueueSnackbar } from 'notistack';

interface Values {
  email: string;
}

const initialValues: Values = {
  email: '',
};

export const Component = () => {
  const { t } = useTranslation();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validationSchema = Yup.object({
    email: Yup.string().email(t('mustBeValidEmail')).max(255).required(t('emailRequired')),
  });

  const forgotPasswordMutation = useForgotPassword();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        await forgotPasswordMutation.mutateAsync({ email: values.email });
        enqueueSnackbar(t('passwordResetLinkSent'), { variant: 'success' });

        setErrorMessage('');
      } catch (error) {
        enqueueSnackbar(error?.message, { variant: 'error' });
      }
    },
  });

  return (
    <AuthLayout>
      <Seo title={t('forgotPassword')} />
      <div>
        <Stack
          sx={{ mb: 4 }}
          spacing={1}
        >
          <Typography variant="h5">{t('forgotPassword')}</Typography>
        </Stack>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
        >
          <TextField
            autoFocus
            error={!!(formik.touched.email && formik.errors.email)}
            fullWidth
            helperText={formik.touched.email && formik.errors.email}
            label={t('email')}
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="email"
            value={formik.values.email}
          />
          {successMessage && <Typography color="success.main">{successMessage}</Typography>}
          {errorMessage && <Typography color="error.main">{errorMessage}</Typography>}
          <Button
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            type="submit"
            variant="contained"
          >
            {t('send_reset_link')}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

Component.displayName = 'ForgotPassword';
