import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import { useDetailJob } from '../../DetailJobProvider';
import { EditOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function ApplicantQuestions() {
  const { t } = useTranslation();
  const { jobState } = useDetailJob();

  const job = jobState.data;
  return (
    <Card sx={{
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }
    }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            BAŞVURU SORULARI
          </Typography>
        }
        action={
          <Tooltip title={t('editApplicantQuestions')}>
            <Link
              to={'edit/applicant-questions'}
              className="flex items-center"
            >
              <Button
                size="small"
                sx={{
                  color: '#E31E24',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(227, 30, 36, 0.08)',
                  }
                }}
                startIcon={<EditOutlined />}
              >
                {t('edit')}
              </Button>
            </Link>
          </Tooltip>
        }
        sx={{ borderBottom: '1px solid #f0f0f0' }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Table>
          <TableBody>
            {
              //TODO: change field type
            }
            {job?.applicantForm?.map?.((form: any, formInd: number) => {
              return (
                <TableRow key={form.type + formInd}>
                  <TableCell sx={{ pl: 0 }}>
                    <Typography variant="subtitle2">
                      {t(form.title)} {form.options?.isRequired ? '*' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ pr: 0 }}
                  >
                    <Chip
                      sx={{ background: grey[100], fontSize: 12 }}
                      size="small"
                      label={t(form.type)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card >
  );
}
