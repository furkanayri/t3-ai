import { Box, Button, Chip, Divider, Grid, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { formatDateTime } from 'src/utils/date-format'
import { useTranslation } from 'react-i18next';
import { ArrowDropUp, ArrowDropDown, MoreVertOutlined, ArchiveOutlined, DeleteOutline } from '@mui/icons-material';
import { red } from '@mui/material/colors';

type PropTypes = {
    mode: "upcoming" | "completed",
    meeting: any,
    deleteMeeting: any,
    updateMeeting: any
}
const MeetingCard = ({ meeting, deleteMeeting, updateMeeting, mode }: PropTypes) => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)

    const handleOpen = async () => setIsOpen(pre => !pre)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleDelete = async () => {
        setAnchorEl(null)
        await deleteMeeting(meeting._id)
    }
    const handleUpdate = async () => {
        setAnchorEl(null)
        const newStatus = mode === "upcoming" ? "completed" : "initial"
        await updateMeeting(meeting._id, { ...meeting, status: newStatus })
    }

    return (
        <Grid
            container
            display='flex'
            alignItems='center'
            maxWidth={{ xs: 400, sm: 'none' }}
        >
            <Grid item xs={12} md={8}>
                <Stack direction='row' spacing={{ xs: 2, md: 6, }}>
                    <Typography variant='subtitle1' marginBottom={1} minWidth={200}>{meeting?.jobId?.title}</Typography>
                    <Box>
                        <Typography variant='body2'>{t('scheduledTo')}</Typography>
                        <Typography variant='body2' fontWeight={600}>
                            {formatDateTime(new Date(meeting?.date))}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant='body2'>{t('Candidate')}</Typography>
                        <Typography variant='body2' fontWeight={600}>
                            {meeting?.candidateId?.name + " " + meeting?.candidateId?.surname}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant='body2'>{t('createdBy')}</Typography>
                        <Typography variant='body2' fontWeight={600}>
                            {meeting?.createdBy?.name + " " + meeting?.createdBy?.surname}
                        </Typography>
                    </Box>

                </Stack>
            </Grid>
            <Grid item xs={12} md={4} container justifyContent='flex-end' alignItems='center'>
                <Chip label={meeting?.recruitmentStageStepId?.title} sx={{ marginRight: 2 }} />
                <Button
                    sx={{ marginRight: 2 }}
                    onClick={handleOpen}
                    endIcon={isOpen ? <ArrowDropUp /> : <ArrowDropDown />}>
                    {isOpen ? t('viewLess') : t('viewMore')}
                </Button>
                <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                    <MoreVertOutlined />
                </IconButton>
            </Grid>
            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    onClick={handleUpdate}
                >
                    <ListItemIcon>
                        <ArchiveOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{mode == "upcoming" ? t('markAsCompleted') : t('markAsUpcoming')}</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={handleDelete}
                    sx={{ color: red[500] }}
                >
                    <ListItemIcon>
                        <DeleteOutline
                            color="error"
                            fontSize="small"
                        />
                    </ListItemIcon>
                    <ListItemText>{t('deleteMeeting')}</ListItemText>
                </MenuItem>
            </Menu>
            {isOpen ?
                <Stack spacing={2} sx={{ width: "100%", ml: 2, mt: 2 }}>
                    <Divider />
                    <Box >
                        <Typography variant='body2'>{t('applicationStage')}</Typography>
                        <Typography variant='body2' fontWeight={600}>{meeting?.recruitmentStageStepId?.title}</Typography>
                    </Box>
                    <Box >
                        <Typography variant='body2'>{t('meetingHost')}</Typography>
                        <Typography variant='body2' fontWeight={600}>{meeting?.hostId?.name + " " + meeting?.hostId?.surname}</Typography>
                    </Box>
                    <Box >
                        <Typography variant='body2'>{t('interviewType')}</Typography>
                        <Typography variant='body2' fontWeight={600}>{t(meeting?.type)} {t('meeting')}</Typography>
                    </Box>
                    <Box >
                        <Typography variant='body2'>{t('candidateEmail')}</Typography>
                        <Typography variant='body2' fontWeight={600}>{meeting?.candidateId?.email}</Typography>
                    </Box>
                </Stack>
                : null}
        </Grid>
    )
}

export default MeetingCard