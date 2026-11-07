import { LoadingButton } from '@mui/lab';
import { Alert, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/providers';
import * as Yup from 'yup';
import OTPScreen from './OTPScreen';

interface Values {
    phone: string;
}

const initialValues: Values = {
    phone: '',
};

export default function LoginWithPhoneNumber() {
    const { t } = useTranslation();
    const { loginWithPhone, loginLoading, error, sentOTPCount, closeOTPScreen } = useAuth();

    const validationSchema = Yup.object({
        phone: Yup.string().max(255).required(t('Phone is required')),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            loginWithPhone(values.phone);
        },
    });

    return (
        <>
            <OTPScreen
                open={sentOTPCount > 0}
                onClose={closeOTPScreen}
                phone={formik.values.phone}
            />
            <form
                noValidate
                onSubmit={formik.handleSubmit}
            >
                <Stack spacing={3}>
                    {error ? (
                        <Alert
                            severity="error"
                            sx={{ my: 1 }}
                        >
                            {error}
                        </Alert>
                    ) : null}
                    <TextField
                        autoFocus
                        error={!!(formik.touched.phone && formik.errors.phone)}
                        fullWidth
                        helperText={formik.touched.phone && formik.errors.phone}
                        label={t('Phone Number')}
                        name="phone"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        type="phone"
                        value={formik.values.phone}
                    />
                </Stack>
                <LoadingButton
                    fullWidth
                    sx={{ mt: 3 }}
                    size="large"
                    type="submit"
                    variant="contained"
                    loading={loginLoading}
                >
                    {t('Continue')}
                </LoadingButton>
                {/* <Box sx={{ mt: 3 }}>
        <Link
          href="#"
          underline="hover"
          variant="subtitle2"
        >
          Forgot password?
        </Link>
      </Box> */}
            </form>
        </>
    );
}
