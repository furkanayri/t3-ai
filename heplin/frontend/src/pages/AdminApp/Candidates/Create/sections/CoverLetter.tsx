import { Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Candidate } from 'src/types';

export default function Files() {
  const { t } = useTranslation();
  const { values, handleBlur, handleChange, errors, touched } = useFormikContext<Candidate>();
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
            <Typography variant="h6">{t('coverLetter')}</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('defineTitleOfTheJob_selectDepartment')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <div className="flex items-center gap-x-4">
              <Button variant="contained">{t('uploadFile')}</Button>
              <div>
                {('orManually')} <span className="underline">{t('add')}</span>
              </div>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
