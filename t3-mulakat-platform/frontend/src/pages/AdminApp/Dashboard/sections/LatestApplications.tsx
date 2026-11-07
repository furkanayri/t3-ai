import type { CSSProperties, FC } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceStrict, isValid } from 'date-fns';
import { Avatar, Divider, IconButton, Alert, CircularProgress, Tooltip, Box } from '@mui/material';

import { customLocale } from 'src/utils/date-locale';
import { useNavigate } from 'react-router';
import { Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StepChip } from 'src/components/shared';

interface LatestApplicationsProps {
  applications: any[];
  loading: boolean;
  fetching: boolean;
  onRefetch: () => void;
  error?: string;
}

export const LatestApplications: FC<LatestApplicationsProps> = (props) => {
  const { applications } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='py-[25px] rounded-[13px]'
      style={{
        boxShadow: "0px 4px 14.8px 0px #A6A6A640"
      }}
    >
      <div className='flex justify-between items-center mb-6 px-[20px]'>
        <p className='font-medium leading-5'>
          {t('latestApplications')}
        </p>
        <IconButton
          color="inherit"
          onClick={props.onRefetch}
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : props.error ? (
          <Box>
            <Alert severity="error">{props.error}</Alert>
          </Box>
        ) : applications.length === 0 ? (
          <Box sx={{ px: '20px', py: '10px' }}>
            <Alert severity="warning">{t('There are no applications')}</Alert>
          </Box>
        ) : (
          applications.map((application) => {
            const appliedDate = new Date(application?.createdAt);
            const ago = isValid(appliedDate)
              ? formatDistanceStrict(appliedDate, new Date(), {
                addSuffix: true,
                locale: customLocale,
              })
              : '-';

            return (
              <li
                className='flex items-center cursor-pointer hover:bg-slate-100 px-[20px] py-[10px]'
                key={application?._id}
                onClick={() => {
                  navigate(
                    `candidates?candidateId=${application?.candidateId?._id}`
                  );
                }}
              >
                <Avatar src={application?.candidateId?.userId?.avatar}
                  sx={{
                    width: 29,
                    height: 29,
                    fontSize: 12,
                    mr: "12px"
                  }}
                >
                  {application?.candidateId?.name?.[0]}
                  {application?.candidateId?.surname?.[0]}
                </Avatar>
                <div className='w-[130px]'>
                  <p className='text-sm text-black font-medium leading-[16px] whitespace-nowrap text-ellipsis overflow-hidden'>
                    <span>{application?.candidateId?.name} </span>
                    <span>{application?.candidateId?.surname}</span>
                  </p>
                  <p className='text-xs text-[#979797] font-medium whitespace-nowrap text-ellipsis overflow-hidden'>
                    {application?.jobId?.title}
                  </p>
                </div>
                <div className='w-[100px]'>
                  <StepChip
                    step={application?.currentRecruitmentStepId}
                    style={{ fontSize: 12 }}
                  />
                </div>
                <Tooltip title={appliedDate.toLocaleString()}>
                  <p className='text-xs text-[#979797] font-medium whitespace-nowrap ml-auto'>
                    {ago}
                  </p>
                </Tooltip>
              </li>
            );
          })
        )}
      </ul>
      <Divider />
    </div>
  );
};

LatestApplications.propTypes = {
  applications: PropTypes.array.isRequired,
};

