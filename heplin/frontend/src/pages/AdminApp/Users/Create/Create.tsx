import { useTranslation } from 'react-i18next';
import { Button, Checkbox, FormLabel, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useFormik } from 'formik'
import { enqueueSnackbar } from 'notistack'
import { useNavigate } from 'react-router'
import { useCreateUserMutation } from 'src/hooks/useServices/admin'
import * as yup from 'yup'
import { Link } from 'react-router-dom';

export function Component() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const validationSchema = yup.object({
        email: yup.string().email('Invalid email').required(),
        name: yup.string().required(),
        surname: yup.string().required(),
        password: yup.string().required(),
        isAcceptedTOS: yup.boolean().oneOf([true], t('This field must be checked')),
        isAcceptedKVKK: yup.boolean().oneOf([true], t('This field must be checked')),
        phone: yup.string(),
        identificationNumber: yup.string(),
        gender: yup.string().oneOf(["male", "female"]),
        maritalStatus: yup.string().oneOf(["single", "married"]),
        militaryStatus: yup.string().oneOf(["completed", "exempt", "incomplete"]),
        address: yup.string(),
    })

    const createUserMutation = useCreateUserMutation()

    const { values, handleChange, handleSubmit, errors, touched, setFieldValue, handleBlur } = useFormik({
        initialValues: {
            email: '',
            name: '',
            surname: '',
            password: '',
            phone: '',
            identificationNumber: "",
            gender: "",
            maritalStatus: "",
            militaryStatus: "",
            address: "",
            isAcceptedTOS: false,
            isAcceptedKVKK: false,
        },
        validationSchema: validationSchema,
        onSubmit: async (values: any) => {
            createUserMutation.mutate({ payload: values }, {
                onSuccess(data, variables, context) {
                    enqueueSnackbar(t('savedChanges'), { variant: 'success' });
                    navigate("/users")
                },
                onError(error, variables, context) {


                    enqueueSnackbar(t('updateFailed'), { variant: 'error' });
                }
            })
        }
    })
    return (
        <div className='sm:pr-[55px] w-full max-w-5xl'>
            <p className='text-2xl font-medium mb-[30px]'>{t('newUser')}</p>
            <div
                className='mt-[20px] p-4'
                style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
            >
                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-3 mb-2'>
                        <div className='w-full flex gap-2 '>
                            <TextField
                                size='small'
                                fullWidth
                                value={values.name}
                                onChange={handleChange}
                                name='name'
                                label={t('Name')}
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name as any}
                                required
                            />
                            <TextField
                                size='small'
                                fullWidth
                                value={values.surname}
                                onChange={handleChange}
                                name='surname'
                                label={t('Surname')}
                                error={touched.surname && Boolean(errors.surname)}
                                helperText={touched.surname && errors.surname as any}
                                required
                            />
                        </div>
                        <TextField
                            size='small'
                            value={values.email}
                            onChange={handleChange}
                            name='email'
                            label={t('email')}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email as any}
                            required
                        />
                        <TextField
                            size='small'
                            value={values.password}
                            onChange={handleChange}
                            name='password'
                            label={t('Password')}
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password as any}
                            required
                        />
                        <TextField
                            size='small'
                            value={values.phone}
                            onChange={handleChange}
                            name='phone'
                            label={t('phone')}
                            error={touched.phone && Boolean(errors.phone)}
                            inputProps={{ maxLength: 11 }}
                        />
                        <TextField
                            size='small'
                            value={values.identificationNumber}
                            onChange={handleChange}
                            name='identificationNumber'
                            label={t('identificationNumber')}
                            error={touched.identificationNumber && Boolean(errors.identificationNumber)}
                        />
                        <div className='flex gap-3'>
                            <TextField
                                size='small'
                                value={values.gender}
                                onChange={handleChange}
                                name='gender'
                                label={t('gender')}
                                error={touched.gender && Boolean(errors.gender)}
                                select
                                sx={{ flexGrow: 1 }}
                            >
                                {["male", "female"].map((item) => (
                                    <MenuItem key={item} value={item}> {t(item)} </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                size='small'
                                value={values?.maritalStatus}
                                onChange={handleChange}
                                name='maritalStatus'
                                label={t('maritalStatus')}
                                error={touched?.maritalStatus && Boolean(errors?.maritalStatus)}
                                select
                                sx={{ flexGrow: 1 }}
                            >
                                {["single", "married"].map((item) => (
                                    <MenuItem key={item} value={item}> {t(item)} </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                size='small'
                                value={values.militaryStatus}
                                onChange={handleChange}
                                name='militaryStatus'
                                label={t('militaryStatus')}
                                error={touched.militaryStatus && Boolean(errors.militaryStatus)}
                                select
                                sx={{ flexGrow: 1 }}
                            >
                                {["completed", "exempt", "incomplete"].map((item) => (
                                    <MenuItem key={item} value={item}> {t(item)} </MenuItem>
                                ))}
                            </TextField>
                        </div>
                        <TextField
                            size='small'
                            value={values.address}
                            onChange={handleChange}
                            name='address'
                            label={t('address')}
                            multiline
                            rows={3}
                            error={touched.address && Boolean(errors.address)}
                        />
                    </div>
                    <div className='flex items-center'>
                        <Checkbox
                            id="acceptedTOSCheckbox"
                            checked={values.isAcceptedKVKK}
                            name="policy"
                            onChange={(e) => {
                                setFieldValue('isAcceptedKVKK', e.target.checked);
                            }}
                            onBlur={handleBlur}
                        />
                        <FormLabel
                            sx={{ display: 'flex' }}
                            htmlFor="acceptedTOSCheckbox"
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                            >
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t("Users confirmation to the")}
                                </Typography>
                                <Typography
                                    color="primary"
                                    variant="body2"
                                >
                                    <Link
                                        target="_blank"
                                        to="/terms-and-conditions.html"
                                    >
                                        {t("Terms and Conditions")}
                                    </Link>
                                </Typography>
                            </Stack>
                        </FormLabel>
                    </div>
                    <div className='flex items-center'>
                        <Checkbox
                            id="acceptedKVKKCheckbox"
                            checked={values.isAcceptedTOS}
                            name="policy"
                            onChange={(e) => {
                                setFieldValue('isAcceptedTOS', e.target.checked);
                            }}
                            onBlur={handleBlur}
                        />
                        <FormLabel
                            sx={{ display: 'flex' }}
                            htmlFor="acceptedKVKKCheckbox"
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                            >
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t("Users confirmation to the")}
                                </Typography>
                                <Typography
                                    color="primary"
                                    variant="body2"
                                >
                                    <Link
                                        target="_blank"
                                        to="/kvkk.html"
                                    >
                                        {t("KVKK Compliance Statement")}
                                    </Link>
                                </Typography>
                            </Stack>
                        </FormLabel>
                    </div>
                    <div className='text-right'>
                        <Button type='submit' variant='outlined'>{t('save')}</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

Component.displayName = 'EditUser'
