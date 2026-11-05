import { LoadingButton } from '@mui/lab';
import { Button, Stack } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

export default function PageFooter() {
  const { t } = useTranslation();
  const { isSubmitting } = useFormikContext();
  const { id } = useParams();
  return (
    <Stack
      justifyContent="flex-end"
      direction="row"
      spacing={2}
    >
      <Link to={`/jobs/${id}`}>
        <Button
          variant="outlined"
          color="inherit"
          sx={{ borderColor: 'text.secondary' }}
        >
          {t('Cancel')}
        </Button>
      </Link>
      <LoadingButton
        loading={isSubmitting}
        variant="contained"
        type="submit"
      >
        {t('saveChanges')}
      </LoadingButton>
    </Stack>
  );
}
