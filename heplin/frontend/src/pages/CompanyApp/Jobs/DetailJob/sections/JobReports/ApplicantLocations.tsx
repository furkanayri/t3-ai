import {
  Card,
  CardHeader,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { InfoRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function ApplicantLocations() {
  const { t } = useTranslation();
  return (
    <Card className="relative">
      <CardHeader
        action={
          <Tooltip title="Refresh rate is 24h">
            <SvgIcon>
              <InfoRounded />
            </SvgIcon>
          </Tooltip>
        }
        title={t('locationsByApplicants')}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('location')}</TableCell>
            <TableCell>{t('applicants')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            { country: 'Turkey', city: 'İstanbul', applicants: 10 },
            { country: 'Turkey', city: 'Ankara', applicants: 20 },
          ].map((location) => {
            return (
              <TableRow
                key={location.country}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                  >
                    <Typography variant="subtitle2">
                      {location?.country} {location?.city}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{location.applicants}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
