import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

const hours = ['16:00', '17:00', '15:30'];

const HighlightedDay = styled(PickersDay)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const ServerDay = (props: any) => {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isSelected =
    !props.outsideCurrentMonth && highlightedDays.includes(day.format('YYYY-MM-DD'));

  return (
    <HighlightedDay
      {...other}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
      selected={isSelected}
    />
  );
};
//
const MeetingCalendar = () => {
  const [highlightedDays, setHighlitedDays] = useState([
    '2023-09-29',
    '2023-09-28',
    '2023-09-25',
    '2023-09-27',
    '2023-10-26',
  ]);

  const today = dayjs();

  return (
    <Paper
      elevation={8}
      sx={{ width: 'max-content' }}
    >
      <Stack direction="row">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <StaticDatePicker
            orientation="landscape"
            defaultValue={today}
            minDate={today}
            maxDate={today.add(1, 'month')}
            sx={{
              maxWidth: 360,
              '& .MuiPickersToolbar-root': { display: 'none' },
              '& .MuiDialogActions-root': { display: 'none' },
            }}
            slots={{
              day: ServerDay,
            }}
            // slotProps={{
            //   day: {
            //   selected:highlightedDays.includes(),
            //   },
            // }}
          />
        </LocalizationProvider>
        <Divider
          orientation="vertical"
          flexItem
        />
        <Box sx={{ mt: 1, p: 2 }}>
          <Typography variant="subtitle1">Available Hours</Typography>
          <Stack sx={{ overflowX: 'hidden' }}>
            {hours.map((hour) => (
              <Chip
                key={hour}
                variant="outlined"
                label={hour}
                clickable
                sx={{ m: 1 }}
              ></Chip>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default MeetingCalendar;
