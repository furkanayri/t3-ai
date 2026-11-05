import { useMemo, type FC } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from 'src/providers';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import { useUpdateMeMutation } from 'src/hooks/useServices';
import { useTranslation } from 'react-i18next';
import { LogoUpload } from 'src/components/shared';
import { convertPublicFileURL } from 'src/utils';
import { Alert, Avatar, MenuItem } from '@mui/material';
import { useParams } from 'react-router';
import { useGetUserQuery, useUpdateUserMutation } from 'src/hooks/useServices/admin';

type MilitaryStatus = "completed" | "exempt" | "incomplete"
type Gender = "male" | "female"
type MaritalStatus = "married" | "single"

type UserUpdateValues = {
  name: string;
  surname: string;
  email?: string;
  avatar?: string;
  password?: string;
  maritalStatus?: MaritalStatus;
  gender?: Gender;
  address?: string;
  militaryStatus: MilitaryStatus
  identificationNumber: string
  phone?:string
};

const AccountGeneralSettings = () => {
  const { t } = useTranslation();
  const { id } = useParams()

  const userQuery = useGetUserQuery(id!)
  const user = useMemo(() => userQuery.data?.user, [userQuery.data])

  const updateUserMutation = useUpdateUserMutation();

  const initialValues: UserUpdateValues = {
    name: user?.name ?? '',
    surname: user?.surname ?? '',
    email: user?.email ?? '',
    avatar: user?.avatar,
    password: user?.password ?? '',
    maritalStatus: user?.maritalStatus ?? '',
    gender: user?.gender ?? '',
    address: user?.address ?? '',
    militaryStatus: user?.militaryStatus ?? '',
    identificationNumber: user?.identificationNumber ?? '',
    phone: user?.phone ?? ''
  };
  const { enqueueSnackbar } = useSnackbar();

  if (!user || !id) return <Alert severity="error">{t('userNotFound')}</Alert>
  

  return (
    <div
      id='account-general'
      className='p-[32px] rounded-[13px]'
      style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
    >
      <p className="text text-xl font-semibold mb-5">
        {t('Basic details')}
      </p>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values: UserUpdateValues) => {
          updateUserMutation.mutateAsync(
            { userId: id, payload: values },
            {
              onSuccess: (data) => {
                enqueueSnackbar('Profile updated.', { variant: 'success' });
                window.location.reload();
              },
              onError: (err) => {
                enqueueSnackbar((err as any).message, { variant: 'error' });
              },
            }
          );
        }}
      >
        {({
          handleSubmit,
          values,
          handleBlur,
          handleChange,
          setFieldValue,
          errors,
          touched,
        }) => (
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Stack
                alignItems="center"
                direction="row"
                spacing={{ xs: 0, sm: 2, }}
              >
                <Box
                  sx={{
                    borderColor: 'neutral.300',
                    borderRadius: '50%',
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    p: '4px',
                  }}
                  display={{ xs: 'none', md: 'block' }}
                >
                  <LogoUpload
                    onRemove={async () => {
                      setFieldValue('avatar', undefined);
                      await updateUserMutation.mutateAsync({ userId: id, payload: { avatar: null, name: values.name, surname: values.surname } })
                      return await userQuery.refetch() as any
                    }}
                    image={convertPublicFileURL(values?.avatar)}
                    onUploadCompleted={async (fileKey) => {
                      setFieldValue('avatar', fileKey);
                      await updateUserMutation.mutateAsync({ userId: id, payload: { avatar: fileKey, name: values.name, surname: values.surname } })
                      userQuery.refetch()
                    }}
                    logoFallback={
                      user?.avatar ? <Avatar src={user.avatar} /> :
                        <Typography variant="h6">
                          {user?.name?.[0]?.toUpperCase() + user?.surname?.[0]?.toUpperCase()}
                        </Typography>
                    }
                  />
                </Box>
                <Stack
                  width="100%"
                  alignItems="center"
                  spacing={2}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    width="100%"
                    spacing={2}
                  >
                    <TextField
                      label={t('Name')}
                      name="name"
                      onChange={handleChange}
                      value={values.name ?? ''}
                      onBlur={handleBlur}
                      error={touched.name && !!errors.name}
                      helperText={touched.name && errors.name}
                      required
                      sx={{ flexGrow: 1 }}
                      fullWidth
                    />
                    <TextField
                      label={t('Surname')}
                      name="surname"
                      onChange={handleChange}
                      value={values.surname ?? ''}
                      onBlur={handleBlur}
                      error={touched.surname && !!errors.surname}
                      helperText={touched.surname && errors.surname}
                      required
                      sx={{ flexGrow: 1 }}
                      fullWidth
                    />
                  </Stack>
                  <TextField
                    label={t('Email Address')}
                    name='email'
                    value={values.email ?? ''}
                    onChange={handleChange}
                    fullWidth
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    label={t('Password')}
                    name='password'
                    type='password'
                    onChange={handleChange}
                    value={values.password ?? ''}
                    fullWidth
                    sx={{ flexGrow: 1 }}

                  />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    width="100%"
                    spacing={2}
                  >
                    <TextField
                      label={t('maritalStatus')}
                      name="maritalStatus"
                      onChange={handleChange}
                      value={values?.maritalStatus ?? ''}
                      onBlur={handleBlur}
                      error={touched.maritalStatus && !!errors.maritalStatus}
                      helperText={touched.maritalStatus && errors.maritalStatus}
                      select
                      sx={{ flexGrow: 1 }}
                      fullWidth
                    >
                      {["married", "single"].map((item) => (
                        <MenuItem
                          key={item}
                          value={item}
                        >

                          {t(item)}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label={t('gender')}
                      name="gender"
                      onChange={handleChange}
                      value={values.gender ?? ''}
                      onBlur={handleBlur}
                      error={touched.gender && !!errors.gender}
                      helperText={touched.gender && errors.gender}
                      select
                      sx={{ flexGrow: 1 }}
                      fullWidth
                    >
                      {["male", "female"].map((item) => (
                        <MenuItem
                          key={item}
                          value={item}
                        >
                          {t(item)}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label={t('militaryStatus')}
                      name="militaryStatus"
                      onChange={handleChange}
                      value={values.militaryStatus ?? ''}
                      onBlur={handleBlur}
                      error={touched.militaryStatus && !!errors.militaryStatus}
                      helperText={touched.militaryStatus && errors.militaryStatus}
                      select
                      sx={{ flexGrow: 1 }}
                      fullWidth
                    >
                      {["completed", "exempt", "incomplete"].map((item) => (
                        <MenuItem
                          key={item}
                          value={item}
                        >
                          {t(item)}
                        </MenuItem>
                      ))}
                    </TextField>

                  </Stack>
             
                     <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    width="100%"
                    spacing={2}
                  >
                      <TextField
                    label={t('identificationNumber')}
                    name="identificationNumber"
                    onChange={handleChange}
                    value={values.identificationNumber ?? ''}
                    onBlur={handleBlur}
                    error={touched.identificationNumber && !!errors.identificationNumber}
                    helperText={touched.identificationNumber && errors.identificationNumber}
                    required
                    inputProps={{
                      maxLength: 11
                    }}
                    sx={{ flexGrow: 1 }}
                    fullWidth
                  />
                    <TextField
                      label={t('phone')}
                      name="phone"
                      onChange={handleChange}
                      value={values.phone ?? ''}
                      onBlur={handleBlur}
                      error={touched.phone && !!errors.phone}
                      helperText={touched.phone && errors.phone}
                      sx={{ flexGrow: 1 }}
                      fullWidth
                    />
                  </Stack>
                  <TextField
                    label={t('address')}
                    name="address"
                    onChange={handleChange}
                    value={values.address ?? ''}
                    onBlur={handleBlur}
                    error={touched.address && !!errors.address}
                    helperText={touched.address && errors.address}
                    required
                    InputProps={{
                      inputProps: {
                        minRows: 2
                      }
                    }}
                    sx={{ flexGrow: 1 }}
                    multiline
                    fullWidth
                  />
                </Stack>

              </Stack>
              <Stack justifyContent="flex-end">
                <Box marginLeft="auto">
                  <Button
                    type="submit"
                    variant="outlined"
                  >
                    {t('Save')}
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AccountGeneralSettings;
