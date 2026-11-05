import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material'
import { useFormik } from 'formik'
import { enqueueSnackbar } from 'notistack'
import { useParams } from 'react-router'
import { useGetUserQuery, useUpdateUserMutation } from 'src/hooks/useServices/admin'
import * as yup from 'yup'


const validationSchema = yup.object({
    email: yup.string().email('Invalid email'),
    name: yup.string(),
    surname: yup.string(),
    password: yup.string(),
    phone: yup.string(),
})

export function Component() {
    const { t } = useTranslation();
    const updateUserMutation = useUpdateUserMutation()
    const params = useParams()
    const userQuery = useGetUserQuery(params.id as string)

    const user = userQuery?.data?.user

    const formik = useFormik({
        initialValues: {
            email: user?.email || '',
            name: user?.name || '',
            surname: user?.surname || '',
            password: user?.password || '',
            phone: user?.phone || '',
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values: any) => {
            await updateUserMutation.mutateAsync({
                userId: params.id as string,
                payload: values

            },
                {
                    onSuccess(data, variables, context) {
                        userQuery.refetch()
                        enqueueSnackbar(t('savedChanges'), { variant: 'success' });
                    },
                    onError(error, variables, context) {
                        enqueueSnackbar(t('updateFailed'), { variant: 'error' });
                    },

                }
            )
        }
    })
    return (
        <div className='sm:pr-[55px] w-full max-w-5xl'>
            <p className='text-2xl font-medium mb-[30px]'>{t('updateUser')}</p>
            <div
                className='mt-[20px] p-4'
                style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
            >
                <form onSubmit={formik.handleSubmit}>
                    <div className='flex flex-col gap-4 mb-2'>
                        <div className='w-full flex gap-2 '>
                            <TextField
                                fullWidth
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                name='name'
                                label={t('Name')}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                            />
                            <TextField
                                fullWidth
                                value={formik.values.surname}
                                onChange={formik.handleChange}
                                name='surname'
                                label={t('Surname')}
                                error={formik.touched.surname && Boolean(formik.errors.surname)}
                            />
                        </div>

                        <TextField
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            name='email'
                            label={t('email')}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                        />

                        <TextField
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            name='password'
                            type='password'
                            label={t('Password')}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                        />
                        <TextField
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            name='phone'
                            label={t('phone')}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                        />

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
