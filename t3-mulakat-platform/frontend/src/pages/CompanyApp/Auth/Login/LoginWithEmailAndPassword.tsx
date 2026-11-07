import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Alert, Box, Link, Stack, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/providers";
import * as Yup from 'yup';
interface Values {
  email: string;
  password?: string;
  code?: string;
  newPassword?: string;
}

export default function LoginWithEmailAndPassword() {
  const { t } = useTranslation();
  const { login, verifyCode, loginLoading, error, checkUser } = useAuth();
  const [step, setStep] = useState<'checkUser' | 'login' | 'verifyCode'>('checkUser');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [isMailSent, setIsMailSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(180);
  const [canResend, setCanResend] = useState<boolean>(false);

  const initialValues: Values = {
    email: '',
    password: '',
    code: '',
    newPassword: '',
  };

  const validationSchemas: { [key in typeof step]: Yup.ObjectSchema<any> } = {
    checkUser: Yup.object({
      email: Yup.string().email(t('Must be a valid email')).max(255).required(t('Email is required')),
    }),
    login: Yup.object({
      email: Yup.string().email(t('Must be a valid email')).max(255).required(t('Email is required')),
      password: Yup.string().required(t('Password is required')),
    }),
    verifyCode: Yup.object({
      email: Yup.string().email(t('Must be a valid email')).max(255).required(t('Email is required')),
      code: Yup.string().length(6, t('Code must be 6 digits')).required(t('Code is required')),
      newPassword: Yup.string().min(6, t('Password must be at least 6 characters')).required(t('New password is required')),
    }),
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchemas[step],
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (step === 'checkUser') {
          try {
            const response = await checkUser(values.email);

            if (response?.hasPassword) {
              setStep('login');
            } else {
              setVerificationToken(response?.verificationToken || null);
              setStep('verifyCode');
              setIsMailSent(true);
              startCountdown();
            }
          } catch (error: any) {
            console.error("CheckUser error:", error);
            setErrors({ email: error?.message || t('An error occurred') });
          }
        } else if (step === 'login') {
          await login(values.email, values.password!);
        } else if (step === 'verifyCode') {
          if (!verificationToken) {
            throw new Error("Verification token is missing");
          }
          await verifyCode(verificationToken, values.code!, values.newPassword!);
        }
      } catch (err: any) {
        const errorMessage = t(err.response?.data?.message || err.message || 'Unknown error');
        setErrors({ email: errorMessage });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setCanResend(true);
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (!formik.values.email) return;
    try {
      const response = await checkUser(formik.values.email);

      if (response?.hasPassword) {
        setStep('login');
      } else {
        setVerificationToken(response?.verificationToken || null);
        enqueueSnackbar(t('Verification code resent'), { variant: 'success' });
        setIsMailSent(true);
        setCountdown(180);
        setCanResend(false);
        startCountdown();
      }
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || t('Failed to resend code'), { variant: 'error' });
    }
  };

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
        {error && (
          <Alert severity="error" sx={{ my: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          error={!!(formik.touched.email && formik.errors.email)}
          fullWidth
          helperText={formik.touched.email && formik.errors.email}
          label={t('Email Address')}
          name="email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="email"
          value={formik.values.email}
        />
        {step === 'login' && (
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
        )}
        {step === 'verifyCode' && (
          <>
            <TextField
              error={!!(formik.touched.code && formik.errors.code)}
              fullWidth
              helperText={formik.touched.code && formik.errors.code}
              label={t('Verification Code')}
              name="code"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              inputProps={{ maxLength: 6 }}
              value={formik.values.code}
            />
            <TextField
              error={!!(formik.touched.newPassword && formik.errors.newPassword)}
              fullWidth
              helperText={formik.touched.newPassword && formik.errors.newPassword}
              label={t('New Password')}
              name="newPassword"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.newPassword}
            />
          </>
        )}
      </Stack>
      {/* <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
        {step === 'login' && (
          <Link href="/forgot-password" underline="hover" variant="subtitle2">
            {t('forgotPassword')}
          </Link>
        )}
      </Box> */}
      <LoadingButton
        fullWidth
        sx={{ mt: 3 }}
        size="large"
        type="submit"
        variant="contained"
        loading={formik.isSubmitting || loginLoading}
      >
        {step === 'checkUser' && t('Continue')}
        {step === 'login' && t('Login')}
        {step === 'verifyCode' && t('Verify Code')}
      </LoadingButton>
      {step === 'verifyCode' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {t('Did not receive the code?')}{' '}
            <Link
              component="button"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (canResend) {
                  handleResendCode();
                }
              }}
            >
              {canResend ? t('Resend Code') : `${t('Wait')}: ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`}
            </Link>
          </Typography>
        </Box>
      )}
    </form>
  );
}