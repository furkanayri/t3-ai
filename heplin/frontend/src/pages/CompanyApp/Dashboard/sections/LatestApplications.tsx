import { FC } from 'react';
import { formatDistanceStrict, isValid } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Avatar, Alert, Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { StepChip } from 'src/components/shared';
import { UserMultiple02Icon } from 'hugeicons-react';

interface LatestApplicationsProps {
  applications: any[];
  loading: boolean;
  fetching: boolean;
  onRefetch: () => void;
  error?: string;
}

export const LatestApplications: FC<LatestApplicationsProps> = ({
  applications,
  loading,
  fetching,
  onRefetch,
  error,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const dateLocale = i18n.language === 'tr' ? tr : enUS;

  return (
    <div
      className="p-[22px] rounded-[20px] bg-gradient-to-br from-white to-orange-50 border border-orange-100 transition-all duration-300"
      style={{
        boxShadow: '0px 8px 24px rgba(251, 146, 60, 0.12)',
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-[16px]">
          <div className='bg-gradient-to-br from-[#FB923C] to-[#FED7AA] w-[65px] h-[65px] rounded-[16px] flex justify-center items-center shadow-lg'>
            <UserMultiple02Icon color='#FFFFFF' size={36} />
          </div>
          <div>
            <p className="font-semibold text-[20px] leading-7 text-gray-800 mb-1">{t('latestApplications')}</p>
            <p className="text-[14px] font-medium text-gray-600">{t('manageScholarshipApplications')}</p>
          </div>
        </div>
        <IconButton
          color="inherit"
          onClick={onRefetch}
          disabled={fetching}
          size="small"
          className="hover:bg-orange-100 transition-colors duration-200"
        >
          <Refresh fontSize="inherit" className={fetching ? 'animate-spin' : ''} />
        </IconButton>
      </div>
      <ul>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <div className="relative animate-scaleIn">
              <CircularProgress
                size={48}
                sx={{ color: '#FB923C' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <UserMultiple02Icon size={24} color="#FB923C" className="animate-pulse" />
              </div>
            </div>
          </Box>
        ) : error ? (
          <Box className="animate-fadeIn">
            <Alert
              severity="error"
              sx={{
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {error}
            </Alert>
          </Box>
        ) : applications.length === 0 ? (
          <Box className="flex flex-col items-center justify-center py-12 px-6 animate-fadeIn">
            <div className="w-32 h-32 mb-4 relative">
              <div className="absolute inset-0 bg-orange-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-orange-50 to-white rounded-full flex items-center justify-center">
                <UserMultiple02Icon size={48} color="#FB923C" />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2 animate-slideUp">{t('There are no applications')}</p>
            <p className="text-sm text-gray-500 text-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
              Yeni burs başvuruları burada görünecek
            </p>
          </Box>
        ) : (
          applications.map((application, index) => {
            const appliedDate = new Date(application?.createdAt);

            const capitalizeFirstLetter = (str: string) => {
              return str.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ');
            };

            const ago = isValid(appliedDate)
              ? capitalizeFirstLetter(
                formatDistanceStrict(appliedDate, new Date(), {
                  addSuffix: true,
                  locale: dateLocale,
                })
              )
              : '-';

            return (
              <li
                className="flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-[14px] px-5 py-3 transition-all duration-200 hover:shadow-md mb-2 group animate-slideInRight"
                style={{ animationDelay: `${Math.min(75 * index, 300)}ms` }}
                key={application?._id}
                onClick={() => {
                  navigate(
                    `jobs/${application?.jobId?._id || application?.jobId}/all-applicants?candidateId=${application?.candidateId?._id}`
                  );
                }}
              >
                <Avatar
                  src={application?.candidateId?.userId?.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    mr: '16px',
                    border: '2px solid rgba(251, 146, 60, 0.2)',
                    boxShadow: '0 2px 8px rgba(251, 146, 60, 0.25)',
                  }}
                >
                  {application?.candidateId?.name?.[0]}
                  {application?.candidateId?.surname?.[0]}
                </Avatar>
                <div className="w-[200px]">
                  <p className="text-[15px] text-gray-900 font-semibold leading-5 whitespace-nowrap text-ellipsis overflow-hidden group-hover:text-orange-600 transition-colors duration-200">
                    <span>{application?.candidateId?.name} </span>
                    <span>{application?.candidateId?.surname}</span>
                  </p>
                  <p className="text-[13px] text-gray-600 font-medium whitespace-nowrap text-ellipsis overflow-hidden mt-0.5">
                    {application?.jobId?.title}
                  </p>
                </div>
                <div className="w-[150px] flex justify-center items-center">
                  <StepChip
                    step={application?.currentRecruitmentStepId}
                    style={{ fontSize: 12 }}
                  />
                </div>
                <Tooltip title={appliedDate.toLocaleString()}>
                  <p className="text-[13px] text-gray-500 font-medium whitespace-nowrap ml-auto group-hover:text-orange-600 transition-colors duration-200">
                    {ago}
                  </p>
                </Tooltip>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};