import { LoadingButton } from '@mui/lab';
import { Stack, Typography, alpha } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from "react-i18next";

export default function PageHeader() {
  const { isSubmitting } = useFormikContext();
  const { t } = useTranslation();
  return (
    <Stack

    >
      <LoadingButton
        loading={isSubmitting}
        variant="contained"
        type="submit"
      >
        {t('createCompany')}
      </LoadingButton>
    </Stack>
  );
}
