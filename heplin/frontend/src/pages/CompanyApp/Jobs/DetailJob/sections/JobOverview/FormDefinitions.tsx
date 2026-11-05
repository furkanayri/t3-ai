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

function FieldStatus({ isRequired, isVisible }: { isRequired: boolean; isVisible: boolean }) {
  const { t } = useTranslation();

  const currentTypeStatus = !isVisible ? 'invisible' : isRequired ? 'required' : 'optional';

  return (
    <>
      <Chip
        sx={{
          background: currentTypeStatus === 'required' ? '#DC2626' : currentTypeStatus === 'optional' ? '#10B981' : grey[400],
          color: 'white',
          fontSize: 12,
          fontWeight: 600
        }}
        size="small"
        label={t(currentTypeStatus)}
      />
    </>
  );
}

export default function FormDefinitions() {
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
            FORM TANIMLARI
          </Typography>
        }
        action={
          <Tooltip title={t('Edit form definitions')}>
            <Link
              to={'edit/form-definitions'}
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
      <CardContent sx={{ pt: 3 }}>
        <Table>
          <TableBody>
            {
              //TODO: change field type
            }
            {job?.fields?.map?.((field: any, fieldInd: number) => {
              return (
                <TableRow
                  key={field.type + fieldInd}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#fafafa',
                    },
                    opacity: field.isVisible ? 1 : 0.4,
                    '& td': {
                      borderBottom: '1px solid #f0f0f0',
                      py: 2,
                    }
                  }}
                >
                  <TableCell sx={{ color: '#1a1a1a', fontWeight: 500 }}>
                    {t(field.type)} {field.isRequired ? <span style={{ color: '#E31E24' }}>*</span> : ''}
                  </TableCell>
                  <TableCell align="right">
                    <FieldStatus
                      isRequired={field.isRequired}
                      isVisible={field.isVisible}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
