import React, { Dispatch, SetStateAction } from 'react';
import { Formik } from 'formik';
import {
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon, Close } from '@mui/icons-material/';
import { useSnackbar } from 'notistack';
import {
  useDeleteCandidateLanguageMutation,
  usePostNewCandidateLanguageMutation,
  useUpdateCandidateLanguageMutation,
} from 'src/hooks/useServices';
import { useTranslation } from 'react-i18next';
import { Language } from 'src/types/Language';

interface IPropTypes {
  data: Language;
  mode: 'create' | 'edit';
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  refetch: any;
}


const Drawer = ({ data, mode, setDrawerOpen, refetch }: IPropTypes) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const postNewLanguageMutation = usePostNewCandidateLanguageMutation();
  const updateLanguageMutation = useUpdateCandidateLanguageMutation();
  const deleteLanguageMutation = useDeleteCandidateLanguageMutation();



  const languageLevels = [
    { label: t('beginner'), value: 'beginner' },
    { label: t('pre-intermediate'), value: 'pre-intermediate' },
    { label: t('intermediate'), value: 'intermediate' },
    { label: t('upper-intermediate'), value: 'upper-intermediate' },
    { label: t('advanced'), value: 'advanced' },
    { label: t('proficiency'), value: 'proficiency' },
  ];

  const initialValues: Language = {
    candidateId: data?.candidateId,
    userId: data?.userId,
    name: mode === 'edit' ? data?.name : '',
    languageLevel: mode === 'edit' ? data.languageLevel : 'beginner',

  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        if (mode === 'create') {

          postNewLanguageMutation.mutateAsync(
            { ...values },
            {
              onSuccess: (data) => {
                enqueueSnackbar(t('Created new language.'), { variant: 'success' });
                setDrawerOpen(false);
                refetch();
              },
              onError: (err) => {
                enqueueSnackbar((err as any).message, { variant: 'error' });
              },
            }
          );
        } else {
          updateLanguageMutation.mutateAsync(
            { id: data?._id ?? '', payload: { ...values } },
            {
              onSuccess: (data) => {
                enqueueSnackbar(t('Language updated.'), { variant: 'success' });
                setDrawerOpen(false);
                refetch();
              },
              onError: (err) => {
                enqueueSnackbar((err as any).message, { variant: 'error' });
              },
            }
          );
        }
      }}
    >
      {({ handleSubmit, values, handleBlur, handleChange, setFieldValue, errors, touched }) => (
        <form onSubmit={handleSubmit}>
          <Stack
            spacing={3}
            sx={{ mb: 3, p: { xs: 4, md: 6 } }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="h6">
                {mode === 'create' ? t('New Language') : t('Edit Language')}
              </Typography>
              <Tooltip title={t("Cancel")}>
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack>
              <TextField
                id="outlined-select-currency"
                select
                label="Select"
                defaultValue="EUR"
                helperText="Please select your currency"
                name='name'
                value={values.name}
                onChange={handleChange}
              >
                {['english', 'turkish', 'spanish', 'french', 'german'].map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {t(option)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack>
              <TextField
                fullWidth
                label={t("language level")}
                name="languageLevel"
                value={values.languageLevel ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.languageLevel && !!errors.languageLevel}
                helperText={touched.languageLevel && errors.languageLevel}
                select
                required
              >
                {languageLevels.map((type) => (
                  <MenuItem
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack
              justifyContent="flex-start"
              alignItems="center"
              spacing={1}
            >
              <Stack
                direction="row"
                spacing={2}
                color="grey"
              >
                <Button
                  fullWidth
                  color={mode === 'edit' ? 'error' : 'inherit'}
                  onClick={() => {
                    if (mode === 'edit') {
                      deleteLanguageMutation.mutateAsync(
                        { id: data?._id ?? '' },
                        {
                          onSuccess: (data) => {
                            enqueueSnackbar(t('Language deleted.'), { variant: 'info' });
                            refetch();
                            setDrawerOpen(false);
                          },
                          onError: (err) => {
                            enqueueSnackbar(
                              t('Unable to delete language.') + (err as any).message,
                              { variant: 'error' }
                            );
                          },
                        }
                      );
                    } else {
                      setDrawerOpen(false);
                    }
                  }}
                >
                  {mode === 'edit' ? t('Delete') : t('Cancel')}
                </Button>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                >
                  {t('Save')}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      )}
    </Formik>
  );
};

export default Drawer;
