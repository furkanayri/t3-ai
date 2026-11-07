import { Edit } from '@mui/icons-material';
import { Alert, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { formatMontYear } from 'src/utils/date-format';

type EducationsProps = {
  data: Array<any>;
};

export default function Educations({ data }: EducationsProps) {
  const { t } = useTranslation();
  const { jobId } = useParams();

  return (
    <Card>
      <CardHeader
        title={t("Educations")}
        action={
          <IconButton
            href={`/account?tab=education&goBackJobId=${jobId}`}
            target="_blank"
          >
            <Edit />
          </IconButton>
        }
      ></CardHeader>
      <CardContent className="divide-y !mt-0 !pt-0">
        {data.length === 0 ? <Alert severity="warning">{t('noEducationsFound')}</Alert> : null}
        {data?.map((edu: any) => (
          <Stack
            key={edu._id}
            sx={{ py: 2 }}
          >
            <Stack
              key={edu._id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">{edu.institution}</Typography>
            </Stack>

            <Typography gutterBottom variant="subtitle2">
              {[
                edu.degree,
                edu.major,
              ].filter(Boolean).join(' · ')}
            </Typography>

            <Typography
              gutterBottom
              variant="subtitle2"
            >
              {formatMontYear(edu.startDate)} -{' '}
              {edu.isOngoing ? t('present') : formatMontYear(edu.endDate)}
            </Typography>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}
