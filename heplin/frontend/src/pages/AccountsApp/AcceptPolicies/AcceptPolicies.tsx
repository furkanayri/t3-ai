import { Box, Button, Checkbox, Dialog, DialogContent, FormHelperText, FormLabel, Stack, Typography, Backdrop } from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Logo } from 'src/components/logo';
import { useAuth } from 'src/providers';
import * as Yup from 'yup';
import { useUpdateMeMutation } from 'src/hooks/useServices';

export const Component = () => {
  const { t } = useTranslation();
  const { user, refetchUser, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const updateMeMutation = useUpdateMeMutation();

  const validationSchema = Yup.object({
    isAcceptedTOS: Yup.boolean().oneOf([true], t('This field must be checked')),
    isAcceptedKVKK: Yup.boolean().oneOf([true], t('This field must be checked')),
  });

  const formik = useFormik({
    initialValues: {
      isAcceptedTOS: false,
      isAcceptedKVKK: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateMeMutation.mutateAsync({
          isAcceptedTOS: values.isAcceptedTOS,
          isAcceptedKVKK: values.isAcceptedKVKK,
        });
        enqueueSnackbar(t('Policies accepted successfully'), { variant: 'success' });
        await refetchUser();
      } catch (error: any) {
        enqueueSnackbar(error?.response?.data?.message || t('An error occurred'), { variant: 'error' });
      }
    },
  });

  return (
    <Dialog
      open={true}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
      }}
      slots={{
        backdrop: Backdrop,
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ height: 64, width: 64 }}>
              <Logo />
            </Box>
          </Box> */}

          <Typography variant="h5" align="center">
            {t('Welcome')} {user?.name}!
          </Typography>



          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <Box>
                <Box sx={{ alignItems: 'center', display: 'flex', ml: -1 }}>
                  <Checkbox
                    id="acceptedTOSCheckbox"
                    checked={formik.values.isAcceptedTOS}
                    onChange={(e) => {
                      formik.setFieldValue('isAcceptedTOS', e.target.checked);
                    }}
                    onBlur={formik.handleBlur}
                  />
                  <FormLabel sx={{ display: 'flex', cursor: 'pointer' }} htmlFor="acceptedTOSCheckbox">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography color="text.secondary" variant="body2">
                        {t('I have read the')}
                      </Typography>
                      <Typography color="primary" variant="body2">
                        <Link target="_blank" to="/terms-and-conditions.html">
                          {t('Terms and Conditions')}
                        </Link>
                      </Typography>
                    </Stack>
                  </FormLabel>
                </Box>
                {!!(formik.touched.isAcceptedTOS && formik.errors.isAcceptedTOS) && (
                  <FormHelperText error>{formik.errors.isAcceptedTOS}</FormHelperText>
                )}
              </Box>

              <Box>
                <Box sx={{ alignItems: 'center', display: 'flex', ml: -1 }}>
                  <Checkbox
                    id="acceptedKVKKCheckbox"
                    checked={formik.values.isAcceptedKVKK}
                    onChange={(e) => {
                      formik.setFieldValue('isAcceptedKVKK', e.target.checked);
                    }}
                    onBlur={formik.handleBlur}
                  />
                  <FormLabel sx={{ display: 'flex', cursor: 'pointer' }} htmlFor="acceptedKVKKCheckbox">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography color="text.secondary" variant="body2">
                        {t('I have read the')}
                      </Typography>
                      <Typography color="primary" variant="body2">
                        <Link target="_blank" to="/kvkk.html">
                          {t('KVKK Compliance Statement')}
                        </Link>
                      </Typography>
                    </Stack>
                  </FormLabel>
                </Box>
                {!!(formik.touched.isAcceptedKVKK && formik.errors.isAcceptedKVKK) && (
                  <FormHelperText error>{formik.errors.isAcceptedKVKK}</FormHelperText>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={updateMeMutation.isLoading}
              >
                {t('Continue')}
              </Button>

              <Button variant="text" color="error" onClick={logout} fullWidth>
                {t('Logout')}
              </Button>
            </Stack>
          </form>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

Component.displayName = 'AcceptPolicies';
