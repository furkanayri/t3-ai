import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format, isValid } from 'date-fns';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Calendar03Icon } from 'hugeicons-react';
import { useNavigate } from 'react-router';
import { Refresh } from '@mui/icons-material';
import { enUS, tr } from 'date-fns/locale';

interface OverviewEventsProps {
  events: any[];
  loading: boolean;
  fetching: boolean;
  onRefetch: () => void;
  error?: string;
}

export const OverviewEvents: FC<OverviewEventsProps> = (props) => {
  const { t, i18n } = useTranslation();
  const { events } = props;

  const comingEvents = events.slice(0, 5);
  const navigate = useNavigate();
  const dateLocale = i18n.language === 'tr' ? tr : enUS;
  return (
    <>
      <div className='py-[25px] rounded-[20px] cursor-pointer bg-gradient-to-br from-white to-purple-50 border border-purple-100 hover:scale-[1.02] transition-all duration-300'
        style={{
          boxShadow: "0px 8px 24px rgba(147, 51, 234, 0.12)"
        }}
        onClick={() => {
          navigate("meetings");
        }}
      >
        <div className='flex justify-between items-center mb-6 px-[20px]'>
          <p className='font-semibold text-[18px] leading-6 text-gray-800'>
            {t('upcomingMeetings')}
          </p>
          <IconButton
            color="inherit"
            onClick={(e) => {
              e.stopPropagation()
              props.onRefetch()
            }}
            disabled={props.fetching}
            size='small'
          >
            <Refresh
              fontSize="inherit"
              className={props.fetching ? 'animate-spin' : ''}
            />
          </IconButton>
        </div>
        <ul>
          {props.loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
              <div className="relative animate-scaleIn">
                <CircularProgress
                  size={48}
                  sx={{ color: '#9333EA' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar03Icon size={24} color="#9333EA" className="animate-pulse" />
                </div>
              </div>
            </Box>
          ) : props.error ? (
            <Box>
              <Alert severity="error">{props.error}</Alert>
            </Box>
          ) : comingEvents.length === 0 ? (
            <Box className="flex flex-col items-center justify-center py-12 px-6 animate-fadeIn">
              <div className="w-32 h-32 mb-4 relative">
                <div className="absolute inset-0 bg-purple-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-purple-50 to-white rounded-full flex items-center justify-center">
                  <Calendar03Icon size={48} color="#9333EA" className="animate-bounce" />
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-2 animate-slideUp">{t('noUpcominmeetings')}</p>
              <p className="text-sm text-gray-500 text-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
                Planlanan toplantılar burada görünecek
              </p>
            </Box>
          ) : (
            comingEvents.map((event) => {
              const meetingDate = new Date(event?.createdAt);
              const createdAtMonth = isValid(meetingDate)
                ? format(meetingDate, 'LLL', { locale: dateLocale }).toUpperCase()
                : '-';
              const createdAtDay = isValid(meetingDate)
                ? format(meetingDate, 'd', { locale: dateLocale })
                : '-';
              return (
                <li
                  key={event?._id + event?.candidateId}
                  className='flex items-center pl-[20px] py-[8px] pr-[40px] gap-[10px] hover:bg-purple-50 rounded-lg transition-all duration-200 animate-slideInRight group'
                  style={{ animationDelay: `${Math.min(75 * comingEvents.indexOf(event), 300)}ms` }}
                >
                  <div className='text-sm bg-gradient-to-br from-[#9333EA] to-[#A855F7] text-white capitalize rounded-[12px] px-[8px] py-[8px] text-center shadow-md'>
                    <p>{createdAtMonth?.toLowerCase()}</p>
                    <p className='font-bold'>{createdAtDay}</p>
                  </div>
                  <div className='grow'>
                    <p className='font-medium text-sm'>{event.candidateId?.name} {event.candidateId?.surname}</p>
                    <p className='text-sm text-[#979797]'>{event.jobId?.title}</p>
                  </div>
                  <div>
                    <Calendar03Icon size={28} color='#9333EA' />
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </div>

      {/* <Card>
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
                        {event.candidateId?.name} {event.candidateId?.surname}
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
      </Card> */}
    </>
  );
};

OverviewEvents.propTypes = {
  events: PropTypes.array.isRequired,
};
