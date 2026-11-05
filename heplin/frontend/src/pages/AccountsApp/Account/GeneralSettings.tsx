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
import { Avatar, MenuItem } from '@mui/material';
import { use } from 'i18next';

const militaryStatus = [
  {
    label: 'completed',
    value: 'completed',
  },
  {
    label: 'exempt',
    value: 'exempt',
  },
  {
    label: 'incomplete',
    value: 'incomplete',
  },
];
const gender = [
  {
    label: 'male',
    value: 'male',
  },
  {
    label: 'female',
    value: 'female',
  },
  {
    label: 'other',
    value: 'others',
  },
];
const maritalStatus = [
  {
    label: 'married',
    value: 'married',
  },
  {
    label: 'single',
    value: 'single',
  },
];



type MilitaryStatus = "completed" | "exempt" | "incomplete"
type Gender = "male" | "female" | "others"
type MaritalStatus = "married" | "single"

type UserUpdateValues = {
  name: string;
  surname: string;
  avatar?: string;
  maritalStatus?: MaritalStatus;
  gender?: Gender;
  address?: string;
  militaryStatus: MilitaryStatus
  identificationNumber: string
  phone?: string
};

const AccountGeneralSettings = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const user = auth?.user;
  const updateMeMutation = useUpdateMeMutation();

  const initialValues: UserUpdateValues = {
    name: user?.name ?? '',
    surname: user?.surname ?? '',
    avatar: user?.avatar,
    phone: user?.phone ?? '',
    maritalStatus: user?.maritalStatus ?? '',
    gender: user?.gender ?? '',
    address: user?.address ?? '',
    militaryStatus: user?.militaryStatus ?? '',
    identificationNumber: user?.identificationNumber ?? ''
  };
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
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
          onSubmit={(values: UserUpdateValues) => {
            updateMeMutation.mutateAsync(
              values,
              {
                onSuccess: (data) => {
                  enqueueSnackbar(t('Profile updated.'), { variant: 'success' });
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
                    {/* <Box
                            sx={{
                              borderRadius: '50%',
                              height: '100%',
                              width: '100%',
                              position: 'relative',
                            }}
                          >
                            <Avatar
                              sx={{
                                height: 100,
                                width: 100,
                              }}
                            >
                              <Typography fontSize={32}>
                                {user?.name[0] + user?.surname[0]}
                              </Typography>
                            </Avatar>
                          </Box> */}
                    {/* <LogoUpload
                    onRemove={async () => {
                      setFieldValue('avatar', undefined);
                      await updateMeMutation.mutateAsync({ avatar: null, name: values.name, surname: values.surname })
                      return await auth.refetchUser()
                    }
                    }
                    image={convertPublicFileURL(values?.avatar)}
                    onUploadCompleted={async (fileKey) => {
                      setFieldValue('avatar', fileKey);
                      await updateMeMutation.mutateAsync({ avatar: fileKey, name: values.name, surname: values.surname })
                      await auth.refetchUser()
                    }}
                    logoFallback={
                      user?.avatar ? <Avatar src={user.avatar} /> :
                        <Typography variant="h6">
                          {user?.name[0]?.toUpperCase() + user?.surname[0]?.toUpperCase()}
                        </Typography>
                    }
                  /> */}
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
                        disabled
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
                        disabled
                        sx={{ flexGrow: 1 }}
                        fullWidth
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      defaultValue={user?.email}
                      label="Email"
                      sx={{ flexGrow: 1 }}
                      disabled
                    />

                  </Stack>

                </Stack>

              </Stack>
            </form>
          )}
        </Formik>
        {/* <Card>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              md={4}
            >
              <Typography variant="h6">Public profile</Typography>
            </Grid>
            <Grid
              xs={12}
              sm={12}
              md={8}
            >
              <Stack
                divider={<Divider />}
                spacing={3}
              >
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">Make Contact Info Public</Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Means that anyone viewing your profile will be able to see your contacts
                      details.
                    </Typography>
                  </Stack>
                  <Switch />
                </Stack>
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">Available to hire</Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Toggling this will let your teammates know that you are available for
                      acquiring new projects.
                    </Typography>
                  </Stack>
                  <Switch defaultChecked />
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              md={4}
            >
              <Typography variant="h6">Delete Account</Typography>
            </Grid>
            <Grid
              xs={12}
              md={8}
            >
              <Stack
                alignItems="flex-start"
                spacing={3}
              >
                <Typography variant="subtitle1">
                  Delete your account and all of your source data. This is irreversible.
                </Typography>
                <Button
                  color="error"
                  variant="outlined"
                >
                  Delete account
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card> */}
      </div>

      {/* Kullanım Klavuzu */}
      <div
        id='usage-guide'
        className='p-[32px] rounded-[13px] '
        style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
      >
        <p className="text text-xl font-semibold mb-5">
          {t('Usage Guide')}
        </p>
        <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto' }}>
          <video
            controls
            style={{
              width: '100%',
              borderRadius: '8px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <source src="/assets/offical.mp4" type="video/mp4" />
            {t('Your browser does not support the video tag.')}
          </video>
        </Box>
      </div>
    </>

  );
};

export default AccountGeneralSettings;
