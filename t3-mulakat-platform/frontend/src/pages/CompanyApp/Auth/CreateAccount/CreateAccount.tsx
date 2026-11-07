import { LoadingButton } from "@mui/lab";
import { Alert, Stack, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Seo } from "src/components/seo";
import AuthLayout from "src/pages/CompanyApp/Auth/AuthLayout";
import { useAuth } from "src/providers";
import * as Yup from 'yup';

export function Component() {
    const { t } = useTranslation()
    const [error, setError] = useState("")
    const { createProfile } = useAuth()

    const [searchParams] = useSearchParams()

    const registrationToken = searchParams.get('registrationToken')

    const formik = useFormik({
        initialValues: {
            name: "",
            surname: "",
            password: "",
            passwordConfirm: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().max(255).required(t('Name is required')),
            surname: Yup.string().max(255).required(t('Surname is required')),
            password: Yup.string().max(255).required(t('Password is required')),
            passwordConfirm: Yup.string().max(255).required(t('Password Confirm is required')).test('passwords-match', t('Passwords must match'), function (value) {
                return this.parent.password === value;
            })
        }),
        onSubmit: async (values, helpers) => {
            try {
                createProfile({ ...values, token: registrationToken?.toString() ?? "" })
            } catch (error) {
                helpers.setSubmitting(false)
            }
        }
    })

    if (!registrationToken) return null
    return (
        <AuthLayout>
            <Seo title="Create Account" />
            <div>
                <Stack
                    sx={{ mb: 4 }}
                    spacing={1}
                >

                    <Typography variant="h5">{t('Create Account')}</Typography>

                    {error ? (
                        <Alert
                            severity="error"
                            sx={{ my: 1 }}
                        >
                            {error}
                        </Alert>
                    ) : null}
                </Stack>
                <form
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <Stack spacing={3}>
                        <TextField
                            error={!!(formik.touched.name && formik.errors.name)}
                            fullWidth
                            helperText={formik.touched.name && formik.errors.name}
                            label={t('Name')}
                            name="name"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="text"
                            value={formik.values.name}
                        />
                        <TextField
                            error={!!(formik.touched.surname && formik.errors.surname)}
                            fullWidth
                            helperText={formik.touched.surname && formik.errors.surname}
                            label={t('Surname')}
                            name="surname"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="text"
                            value={formik.values.surname}
                        />
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
                            label={t('passwordConfirm')}
                            name="passwordConfirm"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="password"
                            value={formik.values.passwordConfirm}
                        />
                    </Stack>
                    <LoadingButton
                        fullWidth
                        sx={{ mt: 3 }}
                        size="large"
                        type="submit"
                        variant="contained"
                        loading={formik.isSubmitting}
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
            </div>
        </AuthLayout>
    );
}

Component.displayName = "CreateAccount"