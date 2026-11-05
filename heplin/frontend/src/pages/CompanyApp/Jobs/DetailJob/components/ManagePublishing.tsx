import { useTranslation } from 'react-i18next';

import { useDetailJob } from '../DetailJobProvider';
import {
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { array } from 'src/utils';
import { useEffect, useState } from 'react';

type ManagePublishingProps = {
  open: boolean;
  onClose: () => void;
};

const colorMapper: any = {
  "draft": "default",
  "pending": "warning",
  "published": "success",
  "declined": "error"
}

const validPublishedChannelStatus = ['pending', 'published'];
export default function ManagePublishing({
  open,
  onClose,
}: ManagePublishingProps) {
  const [publishedChannels, setPublishedChannels] = useState<any[]>([]);
  const { t } = useTranslation();
  const { postingChannels, jobState, togglePublish, togglePublishState } = useDetailJob();

  useEffect(() => {
    const publishedChannelsOfJob = array<any>(jobState.data?.publishedChannels);

    const userPublishedChannels = postingChannels.map((c) => {
      const findStatus = publishedChannelsOfJob.find((p) => p?.channelId === c?._id);

      return {
        ...c,
        isActive: validPublishedChannelStatus.includes(findStatus?.status || 'draft'),
        channelId: c?._id,
        status: findStatus?.status || 'draft',
      };
    });
    setPublishedChannels(userPublishedChannels);
  }, [jobState.data?.publishedChannels, postingChannels]);

  const onChangeStatus = (currentChecked: boolean, index: number) => {
    const _copy = [...publishedChannels];
    const status = !!currentChecked ? 'pending' : 'draft';

    _copy[index].status = status;
    _copy[index].isActive = validPublishedChannelStatus.includes(status)

    setPublishedChannels(_copy);
    togglePublish({
      channelId: _copy[index].channelId,
      action: !!currentChecked ? "publish" : "unpublish"
    }, {})
  };

  if (!open) return null;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{t("jobPostingManagement")}</DialogTitle>
      <Divider />
      <DialogContent className='relative'>
        {togglePublishState.isLoading && <Stack sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }} className='bg-slate-100 bg-opacity-60'>
          <CircularProgress />
        </Stack>}
        <Stack spacing={2}>
          {publishedChannels.map((channel, index) => {
            const domain = channel?.values?.domain;
            const subdomain = channel?.values?.subdomain;

            return (
              <Stack
                flexDirection={'row'}
                justifyContent={'space-between'}
                key={channel?._id}
              >
                <Stack>
                  <Typography
                    color={'text.primary'}
                    variant="subtitle1"
                  >
                    {channel?.name}
                  </Typography>
                  <Typography
                    color={'text.secondary'}
                    variant="caption"
                  >
                    {(domain ? `https://${domain}` : null) ||
                      (subdomain ? `https://${subdomain}.applin.io` : null)}
                  </Typography>
                </Stack>
                <Stack
                  flexDirection={'row'}
                  spacing={1}
                  alignItems={'center'}
                >
                  <Chip
                    size="small"
                    color={colorMapper[channel?.status]}
                    label={t(channel?.status)}
                  />
                  <Switch
                    sx={{ mt: '0 !important' }}
                    onChange={(e, checked) => {
                      onChangeStatus(checked, index);
                    }}
                    checked={channel.isActive}
                  />
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
