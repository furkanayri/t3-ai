import { Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { QuillEditor } from 'src/components/quill-editor';
import type { JobForm } from 'src/types/jobPost';

const departments = [
  { label: 'Design', value: 'design' },
  { label: 'Software', value: 'software' },
  { label: 'Sales', value: 'sales' },
  { label: 'Marketing', value: 'marketing' },
];
export default function ContentForm() {
  const { t } = useTranslation();
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormikContext<JobForm>();

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
            <Typography variant="h6">{t('jobDescription')}</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('defineDescription')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <Stack>
              <QuillEditor
                onChange={(html) => setFieldValue('content', html)}
                value={values.content}
                placeholder={t('writeSomething')}
                onBlur={() => setFieldTouched('content', true)}
                sx={{ minHeight: 400 }}
              />
              {touched.content && errors.content ? (
                <Typography
                  variant="body2"
                  color="red"
                >
                  {t(errors.content)}
                </Typography>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
