import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useUpdateCVFileService } from 'src/hooks/useServices';

type EditFilenameDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string | null;
  id: string | null;
};

export default function EditFilenameDialog({
  open,
  onClose,
  onSuccess,
  title,
  id,
}: EditFilenameDialogProps) {
  const { enqueueSnackbar } = useSnackbar();

  const editFileMutation = useUpdateCVFileService();

  const {
    values,
    handleChange,
    handleBlur,
    errors,
    touched,
    handleSubmit,
    setValues,
    isSubmitting,
  } = useFormik({
    initialValues: {
      title: title ?? '',
    },
    enableReinitialize: true,
    onSubmit: (values, helpers) => {
      if (!id) return;
      editFileMutation.mutate(
        { id, payload: values },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (err: any) => {
            enqueueSnackbar(err?.message, {
              variant: 'error',
            });
          },
        }
      );
    },
  });

  const handleClose = () => {
    setValues({ title: '' });
  };
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      fullWidth
      aria-describedby="alert-dialog-description"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="alert-dialog-title">{t('editFileTitle')}</DialogTitle>
        <DialogContent className="!pt-4">
          <TextField
            fullWidth
            label={t("Title")}
            name="title"
            value={values.title ?? ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched?.title && !!errors?.title}
            helperText={touched?.title && errors?.title}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            sx={{ color: 'text.secondary' }}
            onClick={onClose}
          >
            {t('Cancel')}
          </Button>
          <LoadingButton
            type="submit"
            autoFocus
            loading={isSubmitting}
          >
            {t('update')}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
