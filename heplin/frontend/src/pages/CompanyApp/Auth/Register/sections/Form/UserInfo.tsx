import { useFormikContext } from 'formik';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';
import { TenantPayload } from 'src/types/Tenant';
import Policies from '../../Policies';
import { Card, CardContent, Typography } from '@mui/material';

const UserInfo = () => {
    const { t } = useTranslation();

    const formik =
        useFormikContext<TenantPayload>();
    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>

                    <Typography variant="h6">{t('informationUser')}</Typography>
                    <TextField
                        error={!!(formik.touched.userName && formik.errors.userName)}
                        fullWidth
                        helperText={formik.touched.userName && formik.errors.userName}
                        label={t('Name')}
                        name="userName"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.userName}
                    />
                    <TextField
                        error={!!(formik.touched.userSurname && formik.errors.userSurname)}
                        fullWidth
                        helperText={formik.touched.userSurname && formik.errors.userSurname}
                        label={t('Surname')}
                        name="userSurname"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.userSurname}
                    />
                    <TextField
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
                    <TextField
                        error={!!(formik.touched.phone && formik.errors.phone)}
                        fullWidth
                        helperText={formik.touched.phone && formik.errors.phone}
                        label={t('Phone')}
                        name="phone"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        type="tel"
                        value={formik.values.phone}
                        inputProps={{ maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*' }}
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
                    <Policies />
                </Stack>
            </CardContent>
        </Card>
    )
}

export default UserInfo