import { Button, Card, CardContent, CardHeader, Chip, Tooltip } from '@mui/material';
import { useJobDetail } from '../../context';
import { EditOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';

export default function ApplicantSkills() {
  const { t } = useTranslation();
  const { job } = useJobDetail();

  return (
    <Card>
      <CardHeader
        title={t('candidateSkills')}
        action={
          <Tooltip title={t('editCandidateSkills')}>
            <Link
              to={'edit/candidate-skills'}
              className="flex items-center"
            >
              <Button
                size="small"
                color="inherit"
                sx={{ color: 'text.secondary' }}
                startIcon={<EditOutlined />}
              >
                {t('edit')}
              </Button>
            </Link>
          </Tooltip>
        }
      ></CardHeader>

      <CardContent sx={{ pt: 1 }}>
        <div className="flex flex-wrap gap-4">
          {array<any>(job?.skills).map((skill, ind) => (
            <Chip
              key={skill?._id}
              label={skill?.name?.toString() ?? ''}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
