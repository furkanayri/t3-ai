import { Save } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, Switch } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetPostingChannelByTenantId, useUpdateJobMutation } from "src/hooks/useServices/admin";
import { useJobDetail } from "../../context";
import { enqueueSnackbar } from "notistack";

export default function PublishDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
    const { t } = useTranslation()
    const { job, refetch } = useJobDetail()

    const [selectedChannels, setSelectedChannels] = useState<any[]>([])

    const channelsQuery = useGetPostingChannelByTenantId({ tenantId: job?.tenantId })
    const channels = channelsQuery?.data?.results
    const updateJobMutation = useUpdateJobMutation()

    const handleClose = () => {
        setSelectedChannels([])
        onClose()
    }
    const handleSave = () => {
        const rest = channels?.filter((item: any) => !selectedChannels.includes(item?._id))

        const publishedChannels = [
            ...selectedChannels?.map((channel) => ({
                channelId: channel,
                status: 'published',
                lastPublishedAt: new Date().toISOString()
            })),
            ...rest?.map((channel: any) => ({
                channelId: channel._id,
                status: 'draft',
                lastPublishedAt: null
            }))
        ]


        updateJobMutation.mutate({
            jobId: job?._id,
            payload: {
                publishedChannels
            }
        }, {
            onSuccess: () => {
                enqueueSnackbar(t('publishSuccessful'), { variant: 'success' })
                refetch()
            },
            onError: () => {
                enqueueSnackbar(t('publishFailed'), { variant: 'error' })
            },
            onSettled: () => {
                handleClose()
            }
        })
        handleClose()
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
        >
            <DialogContent>
                {
                    channels?.length === 0 ?
                        <p>
                            {t('noChannels')}
                        </p>
                        :
                        channels?.map((channel: any) => {
                            return (
                                <div key={channel._id} className="flex justify-between items-center gap-4">
                                    <p className="font-semibold">
                                        {channel.name}
                                    </p>
                                    <Switch
                                        size="small"
                                        onChange={(e: any, checked: boolean) => {
                                            if (checked) {
                                                setSelectedChannels([...selectedChannels, channel._id])
                                            } else {
                                                setSelectedChannels(selectedChannels.filter((c) => c !== channel._id))
                                            }
                                        }}
                                        checked={selectedChannels?.includes(channel._id)}
                                    />
                                </div>
                            )
                        })
                }

            </DialogContent>
            <DialogActions className='text-gray-500' style={{ paddingTop: 0 }}>
                <Button
                    onClick={handleClose}
                    color='inherit'
                >
                    {t('cancel')}
                </Button>
                <Button
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={channelsQuery.isLoading || selectedChannels.length === 0}
                >
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
