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
import { EditOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useJobDetail } from '../../context';

export default function ApplicantQuestions() {
  const { t } = useTranslation();
  const { job } = useJobDetail()
  return (
    <Card>
      <CardHeader
        title={t('applicantQuestions')}
        action={
          <Tooltip title={t('editApplicantQuestions')}>
            <Link
              to={'edit/applicant-questions'}
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
      >
      </CardHeader>
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
