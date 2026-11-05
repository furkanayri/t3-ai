import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Button,
    Stack,
    useMediaQuery,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ListItemAvatar,
    Avatar,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { array } from 'src/utils';
import { useGetMyMeetings } from 'src/hooks/useServices/useMeetingServices';
import { ArrowForward } from '@mui/icons-material';
import { RouterLink } from 'src/components/router-link';
import MeetingDialogCandidate from './MeetingDialogCandidate';

export function Component() {
    const { t } = useTranslation();
    const meetingsQuery = useGetMyMeetings();
    const meetingData = array<any>(meetingsQuery?.data?.results);
    const [tabIndex, setTabIndex] = useState(0);
    const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

    const handleTabChange = (event: React.SyntheticEvent, newIndex: number) => {
        setTabIndex(newIndex);
    };

    const now = new Date();
    const upcomingMeetings = meetingData.filter(meeting => new Date(meeting.date) >= now);
    const pastMeetings = meetingData.filter(meeting => new Date(meeting.date) < now);


    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);


    const handleViewCandidate = (url: string | null) => {
        setSelectedUrl(url);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedUrl(null);
    };

    return (
        <>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8,
                }}
            >
                <Container maxWidth="xl">
                    <Stack sx={{ mb: 3 }}>
                        <Typography variant="h4">{t('myMeetings')}</Typography>
                    </Stack>
                    <Card>
                        <Tabs sx={{ padding: 1 }} value={tabIndex} onChange={handleTabChange}>
                            <Tab label={t('upcomingMeetings')} />
                            <Tab label={t('completedMeetings')} />
                        </Tabs>
                        <Divider />
                        <CardContent sx={{ p: 0, paddingBottom: '0px !important' }}>
                            {meetingsQuery.isLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : meetingsQuery.isError ? (
                                <Alert severity="error">{(meetingsQuery?.error as any)?.message}</Alert>
                            ) : (tabIndex === 0 ? upcomingMeetings.length === 0 : pastMeetings.length === 0) ? (
                                <Alert severity="warning" sx={{ m: 4 }}>
                                    {t('thereAreNoMeetingsYet')}
                                </Alert>
                            ) : (
                                !isMobile ? (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('Title')}</TableCell>
                                                <TableCell>{t('Date')}</TableCell>
                                                <TableCell>{t('Type')}</TableCell>
                                                <TableCell>{t('Candidate URL')}</TableCell>
                                                <TableCell>{t('Notes')}</TableCell>
                                                <TableCell>{t('Created By')}</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(tabIndex === 0 ? upcomingMeetings : pastMeetings).map((meeting: any) => (
                                                <MeetingTableItem key={meeting?._id} meeting={meeting} onViewCandidate={handleViewCandidate} />
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <List>
                                        {(tabIndex === 0 ? upcomingMeetings : pastMeetings).map((meeting: any) => (
                                            <MeetingListItem key={meeting?._id} meeting={meeting} onViewCandidate={handleViewCandidate} />
                                        ))}
                                    </List>
                                )
                            )}
                        </CardContent>
                    </Card>
                </Container>
            </Box>


            <MeetingDialogCandidate
                open={dialogOpen}
                onClose={handleCloseDialog}
                url={selectedUrl}
            />
        </>
    );
}

Component.displayName = 'Meetings';


function MeetingTableItem({ meeting, onViewCandidate }: { meeting: any, onViewCandidate: (url: string | null) => void }) {
    const { t } = useTranslation();

    return (
        <TableRow key={meeting?._id}>
            <TableCell>
                <Typography variant="subtitle1">{meeting?.title}</Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2">
                    {new Date(meeting?.date).toLocaleString()}
                </Typography>
            </TableCell>
            <TableCell>
                <Chip label={t(meeting?.type)} size="small" />
            </TableCell>
            <TableCell>
                <Button
                    startIcon={<ArrowForward />}
                    onClick={() => onViewCandidate(meeting?.candicateUrl)}
                >
                    {t('View Candidate')}
                </Button>
            </TableCell>
            <TableCell>
                <Typography variant="body2">{meeting?.notes}</Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2">
                    {`${meeting?.createdBy?.name} ${meeting?.createdBy?.surname} (${meeting?.createdBy?.email})`}
                </Typography>
            </TableCell>
        </TableRow>
    );
}

function MeetingListItem({ meeting, onViewCandidate }: { meeting: any, onViewCandidate: (url: string | null) => void }) {
    const { t } = useTranslation();

    return (
        <ListItem key={meeting?._id} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: '5px', p: 2 }}>
            <ListItemText
                primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {meeting?.title}
                    </Typography>
                }
                secondary={
                    <>
                        <Typography component="span" variant="body2" color="textPrimary">
                            {new Date(meeting?.date).toLocaleString()}
                        </Typography>
                        <br />
                        <Chip label={t(meeting?.type)} size="small" sx={{ mt: 1 }} />
                        <br />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {meeting?.notes}
                        </Typography>
                        <br />
                        <Typography variant="body2">
                            {`${meeting?.createdBy?.name} ${meeting?.createdBy?.surname} (${meeting?.createdBy?.email})`}
                        </Typography>
                    </>
                }
            />

            <ListItemSecondaryAction>
                <Button
                    startIcon={<ArrowForward />}
                    onClick={() => onViewCandidate(meeting?.candicateUrl)}
                >
                    {t('View Candidate')}
                </Button>
            </ListItemSecondaryAction>
        </ListItem>
    );
}
