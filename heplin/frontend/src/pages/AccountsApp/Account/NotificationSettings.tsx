import type { FC } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
export const AccountNotificationsSettings: FC = () => (

  <Card>
    <CardContent>
      <Grid
        container
        spacing={3}
      >
        <Grid
          xs={12}
          md={4}
        >
          <Typography variant="h6">{t('email')}</Typography>
        </Grid>
        <Grid
          xs={12}
          sm={12}
          md={8}
        >
          <Stack
            divider={<Divider />}
            spacing={3}
          >
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1">{t('productUpdates')}</Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  {t('newsAnnouncementsAndProductUpdates')}
                </Typography>
              </Stack>
              <Switch defaultChecked />
            </Stack>
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1">{t('securityUpdates')}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {t('importantNotificationsAboutYourAccountSecurity')}
                </Typography>
              </Stack>
              <Switch defaultChecked />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Grid
        container
        spacing={3}
      >
        <Grid
          xs={12}
          md={4}
        >
          <Typography variant="h6">{t('phoneNotifications')}</Typography>
        </Grid>
        <Grid
          xs={12}
          sm={12}
          md={8}
        >
          <Stack
            divider={<Divider />}
            spacing={3}
          >
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1">{t('securityUpdates')}</Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  {t('importantNotificationsAboutYourAccountSecurity')}
                </Typography>
              </Stack>
              <Switch />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default AccountNotificationsSettings;
