import { Chip, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

//FIXME: change tenant type
export default function GeneralInfo({ tenant }: { tenant: any }) {
  const { t } = useTranslation();
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell width={200}>
            <Typography variant="subtitle2">{t('legalName')}</Typography>
          </TableCell>
          <TableCell>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {tenant?.company?.name}
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={200}>
            <Typography variant="subtitle2">{t('plan')}</Typography>
          </TableCell>
          <TableCell>
            <Chip
              label={tenant?.plan}
              size="small"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={200}>
            <Typography variant="subtitle2">{t('Contact')}</Typography>
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap items-center gap-3">
              <Tooltip title="Support Email">
                <Chip
                  label={'contact@demo.com'}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="Support Email Backup">
                <Chip
                  label={'contact1@demo.com'}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="Support Phone">
                <Chip
                  label={'+49 (232) 232 2424'}
                  size="small"
                />
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={200}>
            <Typography variant="subtitle2">{t('companySize')}</Typography>
          </TableCell>
          <TableCell>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {54}
            </Typography>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>
            <Typography variant="subtitle2">{t('Country')}</Typography>
          </TableCell>
          <TableCell>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {tenant?.country}
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography variant="subtitle2">{t('state_Region')}</Typography>
          </TableCell>
          <TableCell>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {tenant?.city} • {tenant?.district}
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography variant="subtitle2">{t('address_1')}</Typography>
          </TableCell>
          <TableCell>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Street John Wick, no. 7
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography variant="subtitle2">{t('address_2')}</Typography>
          </TableCell>
          <TableCell>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              House #25
            </Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
