import { Button, Card, Dialog, DialogActions, DialogContent, Menu, MenuItem, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useJobDetail } from '../../context';
import { Save } from '@mui/icons-material';
import { useUpdateJobMutation } from 'src/hooks/useServices/admin';
import { useSnackbar } from 'notistack';
import { jobPostStatusColorMapper } from 'src/utils';
import { JobPostChannelStatus } from 'src/types/jobPost';
import { ArrowDown01Icon } from 'hugeicons-react';
import { jobPostChannelStatuses } from 'src/utils/job';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, isValid } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import NotYetPublished from './NotYetPublished';

export default function ListOfChannels() {
    const { job } = useJobDetail()

    return (
        <Card>
            <div className='p-5'>
                {
                    job?.publishedChannels.length === 0 ?
                        <NotYetPublished />
                        :
                        job?.publishedChannels?.map((channel: any) => {
                            return (
                                < PublishedChannelItem
                                    key={channel?._id}
                                    channel={channel}
                                />
                            )
                        }
                        )}
            </div>

        </Card>
    );
};

function PublishedChannelItem({ channel }: { channel: any }) {
    const { job, refetch } = useJobDetail()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isOpen, setOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(channel?.status)
    const { t, i18n } = useTranslation()
    const { enqueueSnackbar } = useSnackbar()
    const updateJobMutation = useUpdateJobMutation()

    const isStatusChanged = useMemo(() => channel?.status !== selectedStatus, [selectedStatus, channel?.status])

    const handleSave = () => {
        const currentChannel = job?.publishedChannels?.find((item: any) => item._id === channel._id)
        const rest = job?.publishedChannels?.filter((item: any) => item._id !== channel._id)
        updateJobMutation.mutate({
            jobId: job?._id,
            payload: {
                publishedChannels: [
                    ...rest,
                    {
                        ...currentChannel,
                        status: selectedStatus,
                        lastPublishedAt: selectedStatus === "published" ? new Date().toISOString() : currentChannel?.lastPublishedAt
                    }
                ]
            }
        }, {
            onSuccess: () => {
                enqueueSnackbar('Status updated successfully', { variant: 'success' })
                refetch?.()
            },
            onError: (error) => {
                enqueueSnackbar('Failed to update status', { variant: 'error' })

            }
        })
        setOpen(false)
    }

    const handleCancel = () => {
        setSelectedStatus(channel?.status)
        setOpen(false)
    }

    const ago = isValid(new Date(channel?.lastPublishedAt)) ?
        formatDistanceToNow(
            new Date(channel?.lastPublishedAt), {
            addSuffix: true,
            locale: i18n.language === 'tr' ? tr : enUS
        })
        : ""

    return (
        <>
            <div className='flex items-center mt-5 justify-between cursor-pointer'>
                <Typography marginRight={1} key={channel?._id}>{channel?.channel?.name}</Typography>
                <div
                    className='relative flex items-center hover:bg-gray-100 rounded-lg  border-[1px] max-w-[120px]'
                    onClick={(e) => {
                        setAnchorEl(e.currentTarget)
                    }}
                >
                    <p className={'uppercase text-xs text-center bg-opacity-40 px-2 py-1 rounded-lg  w-[80px]'}
                        style={{
                            backgroundColor: jobPostStatusColorMapper[selectedStatus as JobPostChannelStatus],
                        }}
                    >
                        {t(selectedStatus)}
                    </p>
                    <ArrowDown01Icon size={18} />
                </div>
                <Menu
                    anchorEl={anchorEl}
                    open={!!anchorEl}
                    onClose={() => {
                        setAnchorEl(null)
                        setOpen(false)
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    {jobPostChannelStatuses.map(status =>
                        <MenuItem
                            key={status}
                            onClick={() => {
                                setOpen(true)
                                setSelectedStatus(status)
                                setAnchorEl(null)
                            }}
                            style={{
                                backgroundColor: status === channel?.status ? 'rgba(0,0,0,0.1)' : 'white',
                                textTransform: "capitalize",
                            }}

                        >
                            {t(status)}
                        </MenuItem>
                    )}
                </Menu>
            </div>
            {channel?.status === "published" && ago &&
                <p className='text-sm text-[#E31E24]'>
                    {ago?.[0]?.toLocaleUpperCase() + ago?.slice(1)}
                </p>}
            <Dialog
                open={isOpen}
                onClose={() => {
                    setSelectedStatus(channel?.status)
                    setOpen(false)
                }}
                slotProps={{
                    backdrop: {
                        style: {
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        },
                    },
                }}
                PaperProps={{
                    sx: {
                        minWidth: '400px',
                        maxWidth: '80%',
                        width: 'auto',
                        height: 'auto',
                    }
                }}
            >
                <DialogContent sx={{ p: 0 }}>
                    <div className='px-6 pt-6 pb-2'>
                        <p className='text-lg font-semibold mb-2' >
                            {t('areYouSureYouWantToChangeStatus')}
                        </p>
                        <div className='flex gap-4 items-center'>
                            <p>{channel?.channel?.name}</p>
                            <p className={'uppercase text-xs px-2 py-1 rounded-lg'}
                                style={{
                                    backgroundColor: jobPostStatusColorMapper[selectedStatus as JobPostChannelStatus],
                                }}
                            >
                                {t(selectedStatus)}
                            </p>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className='text-gray-500' style={{ paddingTop: 0 }}>
                    <Button
                        onClick={handleCancel}
                        color='inherit'
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={!isStatusChanged}
                    >
                        {t('save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}