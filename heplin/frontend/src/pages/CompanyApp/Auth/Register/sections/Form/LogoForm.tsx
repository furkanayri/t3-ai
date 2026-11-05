import {
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { Tenant } from 'src/types/Tenant';
import { convertPublicFileURL } from 'src/utils';
import { useTranslation } from "react-i18next";
import LogoUpload from './LogoUpload';


export default function LogoForm() {
  const { values, setFieldValue } =
    useFormikContext<Tenant>();
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography variant="h6">Logo</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('UploadCompanyLogo')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <Stack spacing={3}>
              <LogoUpload onRemove={() => new Promise(resolve => {
                setFieldValue("logo", undefined);
                resolve(true);
              })} image={convertPublicFileURL(values?.logo)} onUploadCompleted={(fileKey) => setFieldValue("logo", fileKey)} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
