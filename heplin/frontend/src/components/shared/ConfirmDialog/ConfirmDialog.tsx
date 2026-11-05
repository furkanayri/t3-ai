import { LoadingButton } from '@mui/lab';
import {
  Breakpoint,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  title,
  content,
  confirmText,
  closeText,
  confirmColor = 'primary',
  maxWidth,
  fullWidth
}: {
  title?: ReactNode;
  content?: ReactNode;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmText?: string;
  closeText?: string;
  confirmColor?: string;
  maxWidth?: Breakpoint | false;
  fullWidth?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          sx={{ color: 'text.secondary' }}
          onClick={onClose}
        >
          {closeText ?? t('Cancel')}
        </Button>
        <LoadingButton
          onClick={onConfirm}
          autoFocus
          loading={isLoading}
          sx={{ color: confirmColor }}
        >
          {confirmText ?? 'Confirm'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
