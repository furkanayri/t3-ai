import {
    Card,
    CardContent,
    Divider,
    Stack,
} from '@mui/material'
import type { FC } from 'react'
import MeetingCalendar from '../../Components/MeetingCalendar';


export const CalendarTab: FC = () => {

    return (
        <>
            <Card >
                <CardContent>
                    <Stack spacing={2} divider={<Divider />}
                    >
                        <MeetingCalendar />
                    </Stack>
                </CardContent>
            </Card >
        </>
    )
}

export default CalendarTab