import { ArrowRight, MoreVert } from '@mui/icons-material';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import ComingSoon from 'src/components/shared/ComingSoon';

const now = new Date();

type InvoiceStatus = 'paid';

interface Invoice {
  id: string;
  currency: string;
  description: string;
  issueDate: number;
  number: number;
  paymentMethod: string;
  status: InvoiceStatus;
  value: number;
}

const invoices: Invoice[] = [
  {
    id: '5ece2cef3e562cbd61996259',
    currency: '$',
    description: 'Freelancer Subscription (12/05/2019 - 11/06/2019)',
    issueDate: now.getTime(),
    number: 5345,
    paymentMethod: 'Credit Card',
    status: 'paid',
    value: 5.25,
  },
  {
    id: '5ece2cf461b9484866f2968c',
    currency: '$',
    description: 'Freelancer Subscription (12/05/2019 - 11/06/2019)',
    issueDate: now.getTime(),
    number: 4596,
    paymentMethod: 'Credit Card',
    status: 'paid',
    value: 5.25,
  },
];

export default function PlanSettings() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 space-y-4">
      <header>
        <Typography variant="h6">{t('Plan & Billing')}</Typography>
      </header>
      <Divider sx={{ borderColor: 'lightgray' }} />
      <Card className="relative">
        <ComingSoon />
        <CardHeader
          title="T3 Vakfı Mülakat Sistemi Basic Plan"
          subheader={
            <span className="pt-2 block">{t('Basic starter plan for HR management tool')}</span>
          }
        ></CardHeader>
        <Divider></Divider>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell width={200}>
                <Typography variant="subtitle2">{t('paymentMethod')}</Typography>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-x-4">
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    Visa 6443 **** **** **** **
                  </Typography>
                  <Button size="small">{t('changeMethod')}</Button>
                </div>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell width={200}>
                <Typography variant="subtitle2">{t('nextBillingDate')}</Typography>
              </TableCell>
              <TableCell>
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  09.09.2023 for $30.00
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <CardContent>
          <Button variant="contained">{t('changePlan')}</Button>
        </CardContent>
      </Card>
      <Card className="relative">
        <ComingSoon />
        <CardHeader
          action={
            <IconButton>
              <MoreVert />
            </IconButton>
          }
          title="Invoices"
        />
        <Divider />
        <Scrollbar>
          <Table sx={{ minWidth: 1150 }}>
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
        </Scrollbar>
        <TablePagination
          component="div"
          count={invoices.length}
          onPageChange={(): void => {}}
          onRowsPerPageChange={(): void => {}}
          page={0}
          rowsPerPage={5}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    </div>
  );
}
