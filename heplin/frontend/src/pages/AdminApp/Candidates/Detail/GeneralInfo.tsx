import { Chip, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

//FIXME: change user type
export default function GeneralInfo({ user }: { user: any }) {
  const { t } = useTranslation();
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell width={200}>
            <Typography variant="subtitle2">{t('Name')}</Typography>
          </TableCell>
          <TableCell>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {user?.name}
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={200}>
            <Typography variant="subtitle2">{('email')}</Typography>
          </TableCell>
          <TableCell>
            <Chip
              label={user?.email}
              size="small"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell width={200}>
            <Typography variant="subtitle2">{t('phone')}</Typography>
          </TableCell>
          <TableCell>
            <Tooltip title="Support Email">
              <Chip
                label={user?.phone}
                size="small"
              />
            </Tooltip>
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
              {'United States'}
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
              {'Washington'} • {'Redmond'}
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
