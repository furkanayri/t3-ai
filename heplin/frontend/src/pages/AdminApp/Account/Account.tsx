import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Card, CardContent, Grid, Box, Stack, Typography, Container, Avatar, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { useAuth } from 'src/providers';
import { useUpdateMeMutation } from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';
import { LogoUpload } from 'src/components/shared';
import { convertPublicFileURL } from 'src/utils';

type UserUpdateValues = {
  name: string;
  surname: string;
  avatar?: string;
};

export const Component = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const updateMeMutation = useUpdateMeMutation();

  const { user, refetchUser } = useAuth()

  const initialValues: UserUpdateValues = {
    name: user?.name ?? '',
    surname: user?.surname ?? '',
    avatar: user?.avatar,
  };
  usePageView();

  return (
    <>
      <Seo title="Dashboard: Account" />
      <div className='pr-[55px]'>
        <p className='text-2xl font-medium'>{t('Account')}</p>
        <div
          className='mt-[20px] p-8 flex flex-col gap-8 max-w-4xl'
          style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
        >
          <p className='text-xl font-medium'>{t('Basic details')}</p>
          <Formik
            initialValues={initialValues}
            onSubmit={(values: UserUpdateValues) => {
              updateMeMutation.mutateAsync(
                values,
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
                    spacing={{
                      xs: 0,
                      sm: 2,
                    }}
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
                          await updateMeMutation.mutateAsync({ avatar: null, name: values.name, surname: values.surname })
                          return await refetchUser()
                        }
                        }
                        image={convertPublicFileURL(values?.avatar)}
                        onUploadCompleted={async (fileKey) => {
                          setFieldValue('avatar', fileKey);
                          await updateMeMutation.mutateAsync({ avatar: fileKey, name: values.name, surname: values.surname })
                          await refetchUser()
                        }}
                        logoFallback={
                          user?.avatar ? <Avatar src={user.avatar} /> :
                            <Typography variant="h6">
                              {user?.name[0]?.toUpperCase() + user?.surname[0]?.toUpperCase()}
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
                        fullWidth
                        defaultValue={user?.email}
                        label="Email"
                        sx={{ flexGrow: 1 }}
                        disabled
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
      </div>
    </>
  );
};

Component.displayName = 'AccountSettings';
