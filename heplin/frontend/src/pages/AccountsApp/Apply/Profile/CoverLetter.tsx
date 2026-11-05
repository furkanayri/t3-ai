import { Card, CardContent, CardHeader, OutlinedInput } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function CoverLetter({
  coverLetter,
  onChangeCoverLetter,
}: {
  coverLetter?: string;
  onChangeCoverLetter: (val: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader title={t('coverLetter')}></CardHeader>
      <CardContent className="!mt-0 !pt-0">
        <OutlinedInput
          fullWidth
          name="coverLetter"
          multiline
          minRows={4}
          value={coverLetter ?? ''}
          onChange={(e) => onChangeCoverLetter(e.target.value ?? '')}
        />
      </CardContent>
    </Card>
  );
}
