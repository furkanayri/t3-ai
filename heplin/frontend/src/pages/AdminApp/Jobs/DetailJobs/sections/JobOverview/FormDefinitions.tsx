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
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import { useJobDetail } from '../../context';
import { Link } from 'react-router-dom';
import { EditOutlined } from '@mui/icons-material';

function FieldStatus({ isRequired, isVisible }: { isRequired: boolean; isVisible: boolean }) {
  const { t } = useTranslation();
  const currentTypeStatus = !isVisible ? 'invisible' : isRequired ? 'required' : 'optional';

  return (
    <>
      <Chip
        sx={{ background: grey[100], fontSize: 12 }}
        size="small"
        label={t(currentTypeStatus)}
      />
    </>
  );
}

export default function FormDefinitions() {
  const { t } = useTranslation();
  const { job } = useJobDetail()

  return (
    <Card>
      <CardHeader
        title={t('formDefinitions')}
        action={
          <Tooltip title={t('editFormDefinitions')}>
            <Link
              to={'edit/form-definitions'}
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
        <Table>
          <TableBody>
            {
              //TODO: change field type
            }
            {job?.fields?.map?.((field: any, fieldInd: number) => {
              return (
                <TableRow
                  key={field.type + fieldInd}
                  style={field.isVisible ? {} : { opacity: '.4' }}
                >
                  <TableCell>
                    {t(field.type)} {field.isRequired ? '*' : ''}
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
