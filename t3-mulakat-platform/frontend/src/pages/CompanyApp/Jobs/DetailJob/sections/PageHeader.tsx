import { useEffect, useState } from 'react';
import cn from "classnames";
import {
  Stack,
  Typography,
  Button,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  ArchiveOutlined,
  BlockOutlined,
  DeleteOutlined,
  PublishOutlined,
} from '@mui/icons-material';
import { useDetailJob } from '../DetailJobProvider';
import { ManagePublishing } from '../components';
import { ShowIfExist } from 'src/components';
import { useTranslation } from 'react-i18next';
import { array } from 'src/utils';
import ChangeStatusConfirm from '../components/ChangeStatusConfirm';
import { useDialog } from 'src/hooks/use-dialog';
import dayjs from 'dayjs';

export default function PageHeader() {
  const { t, i18n } = useTranslation();
  const managePublishingDialog = useDialog();
  const changeStatusDialog = useDialog<any>();
  const [isPastEndDate, setIsPastEndDate] = useState(false);
  const { jobState, deleteJob, deleteJobState, updateJobStatus, updateJobStatusState } = useDetailJob();
  const dynamicLanguage = i18n.language;
  useEffect(() => {
    const endDate = dayjs(jobState.data?.endDate);
    setIsPastEndDate(endDate.isBefore(dayjs()));
  }, [jobState.data?.endDate]);

  const menuItems = [
    {
      label: t('close'),
      icon: BlockOutlined,
      value: 'closed',
      isVisible: jobState.data?.status === 'active',
    },
    {
      label: t('archive'),
      icon: ArchiveOutlined,
      value: 'archived',
      isVisible: jobState.data?.status !== 'archived',
    },
    {
      label: t('reopen'),
      icon: PublishOutlined,
      value: 'active',
      isVisible: jobState.data?.status !== 'active',
    },
    { label: t('delete'), icon: DeleteOutlined, value: 'delete', color: 'red', isVisible: true },
  ].filter((s) => (s.value === jobState.data?.status || !s.isVisible ? false : true));

  const jobPublishedInChannels = array<any>(jobState.data?.publishedChannels);

  const publishedJobsLength = jobPublishedInChannels.filter(c => c?.status === "published").length
  const onConfirmStatusChange = () => {
    if (changeStatusDialog.data?.status === 'delete') {
      return deleteJob();
    }

    return updateJobStatus(changeStatusDialog.data?.status, {
      onSuccess: () => {
        changeStatusDialog.handleClose()
      },
    });
  };
  const checkDate = dayjs(jobState?.data?.endDate).diff(dayjs(), 'day')
  return (
    <Stack
      sx={{
        position: 'sticky',
        top: 0,
        paddingBlock: '2rem',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        zIndex: 1,
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            {jobState.isLoading ? <Skeleton sx={{ minWidth: '40vw' }} /> : jobState.data?.title}
          </Typography>
          {jobState.isLoading ? (
            <div className="pt-3 flex items-center gap-x-3">
              <Skeleton width={80} height={24} />
              <Skeleton width={80} height={24} />
              <Skeleton width={120} height={24} />
            </div>
          ) : (
            <div className="flex items-center gap-x-3 pt-3 text-gray-600">
              <span className="text-sm">{t(jobState.data?.jobType)}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm">{t(jobState.data?.locationType)}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm flex items-center gap-x-2">
                {[jobState.data?.country?.names?.[dynamicLanguage], jobState?.data?.city, jobState?.data?.district]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isPastEndDate && (
              <Typography variant="body2" sx={{ color: '#E31E24', fontWeight: 500 }}>
                {t('jobIsPastEndDate')}
              </Typography>
            )}
            <span className={`text-sm font-medium ${checkDate <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
              {dayjs(jobState?.data?.endDate).format('DD MMMM YYYY')}
            </span>
          </div>

          <Button
            onClick={() => managePublishingDialog.handleOpen()}
            variant='contained'
            disabled={isPastEndDate}
            sx={{
              backgroundColor: '#E31E24',
              color: 'white',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '8px 20px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#C41B20',
              },
              '&:disabled': {
                backgroundColor: '#f5f5f5',
                color: '#999',
              }
            }}
          >
            <span className={cn("w-2 h-2 rounded-full mr-2", {
              "bg-green-400": publishedJobsLength > 0,
              "bg-gray-300": publishedJobsLength === 0
            })}></span>
            {t("publishedChannels")} ({publishedJobsLength})
          </Button>
        </div>
      </div>

      <ChangeStatusConfirm
        onClose={changeStatusDialog.handleClose}
        open={changeStatusDialog.open}
        status={changeStatusDialog.data?.status}
        onConfirm={onConfirmStatusChange}
        isLoading={deleteJobState.isLoading || updateJobStatusState.isLoading}
      />
      <ManagePublishing
        onClose={() => managePublishingDialog.handleClose()}
        open={managePublishingDialog.open}
      />
    </Stack>
  );
}
