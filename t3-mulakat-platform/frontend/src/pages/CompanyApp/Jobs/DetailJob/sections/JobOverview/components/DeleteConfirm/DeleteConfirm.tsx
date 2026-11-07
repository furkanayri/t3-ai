import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function DeleteConfirm({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Delete comment?'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {t('commentWillBeDeletedConfirm')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          sx={{ color: 'text.secondary' }}
          onClick={onClose}
        >
          {t('close')}
        </Button>
        <LoadingButton
          color="error"
          onClick={onConfirm}
          autoFocus
          loading={isDeleting}
        >
          {t('deleteComment')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
