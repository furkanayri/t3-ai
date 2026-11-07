import { ArrowRight } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { SeverityPill } from 'src/components/severity-pill';
import { invoices } from 'src/fakedata';

//FIXME: change tenant type
export default function Subscription({ tenant }: { tenant: any }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 pt-4 px-4">
      <div>
        <Typography
          variant="h6"
          sx={{ mb: 2 }}
        >
          Plan
        </Typography>
        <div className="flex">
          <Card
            sx={{
              borderColor: grey[300],
              borderWidth: 1,
              minWidth: '300px',
            }}
            variant="outlined"
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  mb: 1,
                  mt: 1,
                }}
              >
                <Typography variant="h5">${'190.00'}</Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 'auto',
                    ml: '4px',
                  }}
                  variant="body2"
                >
                  /mo
                </Typography>
              </Box>
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={3}
              >
                <Typography variant="overline">{tenant?.plan}</Typography>
                <Typography
                  color="primary.main"
                  variant="caption"
                >
                  {t('usingNow')}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </div>
      </div>
      <div>
        <Typography variant="h6">{t('invoices')}</Typography>
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('id')}</TableCell>
              <TableCell>{t('date')}</TableCell>
              <TableCell>{t('description')}</TableCell>
              <TableCell>{t('paymentMethod')}</TableCell>
              <TableCell>{t('total')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell align="right">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => {
              const issueDate = format(invoice.issueDate, 'dd/MM/yyyy | HH:mm');

              return (
                <TableRow key={invoice.id}>
                  <TableCell>#{invoice.number}</TableCell>
                  <TableCell>
                    <Typography
                      noWrap
                      variant="body2"
                    >
                      {issueDate}
                    </Typography>
                  </TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell>
                    {invoice.currency}
                    {invoice.value}
                  </TableCell>
                  <TableCell>
                    <SeverityPill color="primary">{invoice.status}</SeverityPill>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton>
                      <ArrowRight />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
