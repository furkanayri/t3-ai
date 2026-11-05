import { Edit } from '@mui/icons-material';
import { Alert, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

type LanguagesProps = {
  data: Array<any>;
};

export default function Languages({ data }: LanguagesProps) {
  const { t } = useTranslation();
  const { jobId } = useParams();

  return (
    <Card>
      <CardHeader
        title={t("languages")}
        action={
          <IconButton
            href={`/account?tab=experiences&goBackJobId=${jobId}`}
            target="_blank"
          >
            <Edit />
          </IconButton>
        }
      ></CardHeader>
      <CardContent className="divide-y !mt-0 !pt-0">
        {data.length === 0 ? (
          <Alert severity="warning">{t('noLanguagesFound')}</Alert>
        ) : (
          <Stack>
            {data.map((lang) => (
              <Card variant="outlined">
                <Stack
                  key={lang._id}
                  direction='row'
                  spacing={2}
                  alignItems='center'
                  sx={{ py: 2 }}
                >
                  <Typography className='pl-2' variant="h6" fontWeight={500}>{lang.name}</Typography>
                  <Typography
                    gutterBottom
                    variant="subtitle1"
                    color="text.secondary"
                  >
                    • {t(lang.languageLevel)}
                  </Typography>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

      </CardContent>
    </Card>
  );
}
