import React, { useState } from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { JobPostChannelStatus, PopulatedJobPost } from 'src/types/jobPost/jobPost';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PostingChannel } from 'src/types';
import { convertPublicFileURL, jobPostStatusColorMapper } from 'src/utils';
import { Edit02Icon, MoreVerticalCircle01Icon, UserIcon, ViewIcon } from 'hugeicons-react';
import { jobPostChannelStatuses } from 'src/utils/job';
import { useSnackbar } from 'notistack';
import { useUpdateJobMutation } from 'src/hooks/useServices/admin';
import { formatDistanceToNow, isValid } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { IdInfoIcon } from 'src/components/shared';
import { useSearchParams } from 'react-router-dom';

interface JobPostListTableProps {
  items: PopulatedJobPost[];
  channels: PostingChannel[];
  refetchJobs: () => void;
}

export default function JobPostListTable({ items, channels, refetchJobs }: JobPostListTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={80} align='center'>#</TableCell>
            <TableCell width={250}>{t("companyName")}</TableCell>
            <TableCell width={250}>{t("jobTitle")}</TableCell>
            <TableCell width={440}>{t('publishedChannels')}</TableCell>
            <TableCell>{t('actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items?.map((job) => {
            const tenant = job?.tenant;

            return (
              <TableRow
                hover
                key={job._id}
              >
                <TableCell>
                  <IdInfoIcon id={job?._id} />
                </TableCell>
                <TableCell>
                  <div className='flex gap-[6px] items-center uppercase'>
                    <Avatar src={convertPublicFileURL(tenant?.logo ?? "#")} sx={{ width: 26, height: 26 }}>
                      {!tenant?.logo && tenant.name ?
                        <p className='text-xs'>
                          {(tenant?.name[0] + tenant?.name[1])}
                        </p>
                        : null}
                    </Avatar>
                    <p className='font-medium'>
                      {tenant?.name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className='font-medium text-base'>{job?.title}</p>
                  <p className='text-sm text-[#E31E24]'>{`${t(job?.jobType)}, ${t(job?.locationType)}`}</p>
                </TableCell>
                <TableCell>
                  <Stack spacing={1.5} color="text.secondary">
                    {job?.publishedChannels?.length === 0 &&
                      <Typography>{t("notPublishedYet")}</Typography>
                    }
                    {job?.publishedChannels?.map((pc) => {
                      const channel = channels?.find((c) => c._id?.toString() === pc.channelId?.toString());
                      return (
                        <ChannelItem
                          key={job?._id + pc._id}
                          channel={channel}
                          publishedChannel={pc}
                          job={job}
                          refetchJobs={refetchJobs}
                        />
                      )
                    })}
                  </Stack>
                </TableCell>
                <TableCell>
                  <div className='flex h-9'>
                    <Tooltip title={t('showApplicants')} >
                      {/* <div
                        className={`flex items-center justify-center h-[90%] aspect-square cursor-pointer text-[#6C737F]
                          hover:bg-[#6c737f0a] transition-colors duration-200 rounded-full mr-[2px]`}
                        onClick={() => navigate(`/jobs/${job?._id}?activeTab=applications`)}
                      >
                        <p className='text-sm font-semibold'>{job?.applicationNumber}</p>
                      </div> */}
                      <IconButton onClick={() => navigate(`/jobs/${job?._id}?activeTab=applications`)}>
                        <div className='relative'>
                          <UserIcon size={18} />
                          <div
                            className='absolute right-[100%] bottom-[1px] leading-3 text-sm font-semibold rounded-full p-[2px]'
                          >
                            {job?.applicationNumber ?? 0}
                          </div>
                        </div>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('view')} >
                      <IconButton onClick={() => {
                        navigate(`/jobs/${job?._id}?tenantId=${tenant?._id}`)
                      }}>
                        <ViewIcon size={20} />
                      </IconButton>
                    </Tooltip>
                    {/* <Tooltip title={t('edit')} >
                      <IconButton onClick={() => { }}>
                        <Edit02Icon size={18} />
                      </IconButton>
                    </Tooltip> */}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};


function ChannelItem({ channel, publishedChannel, job, refetchJobs }: {
  channel: any,
  publishedChannel: any,
  job?: any,
  refetchJobs: () => void
}) {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { enqueueSnackbar } = useSnackbar()
  const updateJobMutation = useUpdateJobMutation()

  const handleUpdateStatus = (status: JobPostChannelStatus) => {
    const currentChannel = job?.publishedChannels?.find((item: any) => item.channelId === channel._id)
    const rest = job?.publishedChannels?.filter((item: any) => item.channelId !== channel._id)
    updateJobMutation.mutate({
      jobId: job?._id,
      payload: {
        publishedChannels: [
          ...rest,
          {
            ...currentChannel,
            status: status,
            lastPublishedAt: status === "published" ? new Date() : currentChannel?.lastPublishedAt
          }
        ]
      }
    }, {
      onSuccess: () => {
        enqueueSnackbar(t("statusUpdatedSuccessfully"), { variant: 'success' })
        refetchJobs()
      },
      onError: (error) => {
        enqueueSnackbar(t("failedToUpdateStatus"), { variant: 'error' })

      }
    })
    setAnchorEl(null)
  }

  const ago = isValid(new Date(publishedChannel?.lastPublishedAt)) ?
    formatDistanceToNow(
      new Date(publishedChannel?.lastPublishedAt), {
      addSuffix: true,
      locale: i18n.language === 'tr' ? tr : enUS
    })
    : ""
  return (
    <div className='flex gap-4 items-start justify-between'>
      <div>
        <p className='text-base'>{channel?.name}</p>
        {publishedChannel?.status === "published" && ago &&
          <p className='text-sm text-[#E31E24]'>
            {ago?.[0]?.toLocaleUpperCase() + ago?.slice(1)}
          </p>}
      </div>
      <div className='flex gap-1 items-center'>
        <p className={'uppercase text-xs px-2 py-1 rounded-lg h-min'}
          style={{
            backgroundColor: jobPostStatusColorMapper[publishedChannel.status as JobPostChannelStatus],
          }}
        >
          {t(publishedChannel.status)}
        </p>
        <Tooltip title={t("ManagePublishState")}>
          <IconButton onClick={(e) => {
            setAnchorEl(e.currentTarget)
          }}>
            <MoreVerticalCircle01Icon size={18} />
          </IconButton>
        </Tooltip>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => {
          setAnchorEl(null)
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
            onClick={() => handleUpdateStatus(status)}
            disabled={status === publishedChannel.status}
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
  )
}