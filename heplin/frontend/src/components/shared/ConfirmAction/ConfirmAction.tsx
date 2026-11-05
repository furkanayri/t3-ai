import { LoadingButton } from '@mui/lab';
import { Button, Popover, Stack, Typography } from '@mui/material';
import { MouseEventHandler, ReactNode, cloneElement, isValidElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ConfirmActionProps = {
  children: ReactNode;
  title?: string;
  description?: ReactNode;
  onConfirm: () => Promise<any>;
  okText?: string;
  onCancel?: () => void;
};

export default function ConfirmAction({
  children,
  title,
  description,
  onConfirm,
  okText,
}: ConfirmActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation()


  const handleClose = () => {
    setIsOpen(false);
    setAnchorEl(null);
    setIsSubmitting(false);
  };

  const onSubmit: MouseEventHandler<HTMLButtonElement> = async (e) => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setAnchorEl(e.currentTarget);
    setIsOpen(true);
  };

  return isValidElement(children) ? (
    <>
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack
          sx={{ px: 3, py: 2, minWidth: 275 }}
          spacing={2}
        >
          <Typography variant="subtitle1">{title ?? t('Do you confirm?')}</Typography>
          <Typography
            variant="body2"
            color={'text.secondary'}
            component="div"
          >
            {description}
          </Typography>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Button
              size="small"
              sx={{ color: 'text.secondary' }}
              onClick={handleClose}
            >
              {t('Cancel')}
            </Button>
            <LoadingButton
              loading={isSubmitting}
              size="small"
              color="error"
              variant="contained"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {okText ?? t('Confirm')}
            </LoadingButton>
          </Stack>
        </Stack>
      </Popover>
      {cloneElement(children, {
        ...children.props,
        onClick: handleClick,
      })}
    </>
  ) : null;
}
