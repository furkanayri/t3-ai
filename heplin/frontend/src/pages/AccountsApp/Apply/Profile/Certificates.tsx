import { Edit } from '@mui/icons-material';
import { Alert, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { formatMontYear } from 'src/utils/date-format';

type CertificatesProps = {
  data: Array<any>;
};

export default function Certificates({ data }: CertificatesProps) {
  const { t } = useTranslation();
  const { jobId } = useParams();

  return (
    <Card>
      <CardHeader
        title={t('certificates')}
        action={
          <IconButton
            href={`/account?tab=certificate&goBackJobId=${jobId}`}
            target="_blank"
          >
            <Edit />
          </IconButton>
        }
      ></CardHeader>
      <CardContent className="divide-y !mt-0 !pt-0">
        {data.length === 0 ? <Alert severity="warning">{t('noCertificatesFound')}</Alert> : null}
        {data?.map((cer: any) => (
          <Stack
            key={cer._id}
            sx={{ py: 2 }}
          >
            <Stack
              key={cer._id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">{cer.institution}</Typography>
            </Stack>


            <Typography gutterBottom variant="subtitle2">
              {[
                cer.degree,
                cer.major
              ].filter(Boolean).join(' · ')}
            </Typography>

            <Typography
              gutterBottom
              variant="subtitle2"
            >
              {formatMontYear(cer.startDate)} -{' '}
              {cer.isOngoing ? t('present') : formatMontYear(cer.endDate)}
            </Typography>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}
