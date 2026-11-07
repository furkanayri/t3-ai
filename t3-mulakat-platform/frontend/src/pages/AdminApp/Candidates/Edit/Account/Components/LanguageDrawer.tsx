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
import { useParams } from 'react-router';
import { useCreateLanugageMutation, useDeleteLanguageMutation, useUpdateLanugageMutation } from 'src/hooks/useServices/admin';

interface IPropTypes {
  data: Language;
  mode: 'create' | 'edit';
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  refetch: any;
}


const Drawer = ({ data, mode, setDrawerOpen, refetch }: IPropTypes) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const postNewLanguageMutation = useCreateLanugageMutation();
  const updateLanguageMutation = useUpdateLanugageMutation()
  const deleteLanguageMutation = useDeleteLanguageMutation();

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
            { userId: id!, payload: { ...values } },
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
            { userId: id!, languageId: data?._id ?? '', payload: { ...values } },
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
                label={t("language")}
                name="name"
                onChange={handleChange}
                value={values.name ?? ''}
                size="medium"
                variant="outlined"
                type="text"
                placeholder={t("language")}
                onBlur={handleBlur}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                required
              />
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
                        { languageId: data?._id ?? '', userId: id! },
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
