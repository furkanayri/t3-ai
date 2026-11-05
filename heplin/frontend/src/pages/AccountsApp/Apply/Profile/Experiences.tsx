import { Edit } from '@mui/icons-material';
import { Alert, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { formatMontYear } from 'src/utils/date-format';

type ExperiencesProps = {
  data: Array<any>;
};

export default function Experiences({ data }: ExperiencesProps) {
  const { t, i18n } = useTranslation();
  const { jobId } = useParams();
  return (
    <Card>
      <CardHeader
        title={t("Experiences")}
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
        {data.length === 0 ? <Alert severity="warning">{t('noExperiencesFound')}</Alert> : null}

        {data?.map((exp: any) => (
          <Stack
            key={exp?._id}
            sx={{ py: 2 }}
          >
            <Stack
              key={exp?._id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">{exp.title}</Typography>
              <IconButton>{/* <Edit fontSize="small" /> */}</IconButton>
            </Stack>

            <Typography
              gutterBottom
              variant="subtitle2"
            >
              {exp.company} · {t(exp.jobType)}
            </Typography>

            <Typography
              gutterBottom
              variant="subtitle2"
            >
              {formatMontYear(exp.startDate)} -{' '}
              {exp.isOngoing ? t('present') : formatMontYear(exp.endDate)}
            </Typography>

            <Typography variant="caption">
              {[
                exp?.country ? exp?.country?.names?.[i18n?.language] ?? '' : '',
                exp.city,
                exp.district,
              ].filter(Boolean).join(', ')}
            </Typography>

            <Typography
              variant="body2"
              marginTop={1}
            >
              {exp.description}
            </Typography>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}
