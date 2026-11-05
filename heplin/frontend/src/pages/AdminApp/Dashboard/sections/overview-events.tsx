import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format, isValid } from 'date-fns';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import CalendarIcon from '@untitled-ui/icons-react/build/esm/Calendar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/components/router-link';
import { Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface OverviewEventsProps {
  events: any[];
  loading: boolean;
  onRefetch: () => void;
  error?: string;
}

export const OverviewEvents: FC<OverviewEventsProps> = (props) => {
  const { t } = useTranslation();
  const { events } = props;

  return (
    <Card>
      <CardHeader title={t('upcomingMeetings')} />
      <CardContent sx={{ pt: 0 }}>
        <List disablePadding>
          {props.loading ? (
            <ListItem sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </ListItem>
          ) : props.error ? (
            <ListItem>
              <Alert severity="error">{props.error}</Alert>
            </ListItem>
          ) : events.length === 0 ? (
            <ListItem>{t('noUpcominmeetings')}</ListItem>
          ) : (
            events.map((event, ind) => {
              const meetingDate = new Date(event?.createdAt);
              const createdAtMonth = isValid(meetingDate)
                ? format(meetingDate, 'LLL').toUpperCase()
                : '-';
              const createdAtDay = isValid(meetingDate) ? format(meetingDate, 'd') : '-';

              return (
                <ListItem
                  disableGutters
                  sx={{ py: 1.5 }}
                  key={event.id + ind}
                >
                  <ListItemAvatar>
                    <Box
                      sx={{
                        p: 1,
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100',
                        borderRadius: 2,
                        maxWidth: 'fit-content',
                      }}
                    >
                      <Typography
                        align="center"
                        color="text.primary"
                        variant="caption"
                      >
                        {createdAtMonth}
                      </Typography>
                      <Typography
                        align="center"
                        color="text.primary"
                        variant="h6"
                      >
                        {createdAtDay}
                      </Typography>
                    </Box>
                  </ListItemAvatar>
                  <ListItemText>
                    <Typography variant="subtitle2">
                      {event.candidateId?.userId?.name} {event.candidateId?.userId?.surname}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {event.jobId?.title}
                    </Typography>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <IconButton color="inherit">
                      <SvgIcon fontSize="small">
                        <CalendarIcon />
                      </SvgIcon>
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          )}
        </List>
      </CardContent>
      <Divider />
      <CardActions>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon>
              <ArrowRightIcon />
            </SvgIcon>
          }
          size="small"
          LinkComponent={RouterLink}
          href="meetings"
        >
          {t('seeAll')}
        </Button>
      </CardActions>
    </Card>
  );
};

OverviewEvents.propTypes = {
  events: PropTypes.array.isRequired,
};
