import type { FC } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { RouterLink } from 'src/components/router-link';
import { Loader } from 'src/components/shared';
import { useTranslation } from 'react-i18next';
import { JobSearchIcon } from 'hugeicons-react';

interface OverviewAllJobsProps {
  amount: number;
  loading: boolean;
}

export const OverviewAllJobs: FC<OverviewAllJobsProps> = (props) => {
  const { t } = useTranslation();
  const { amount } = props;

  return (
    <Box
      component={RouterLink}
      href='jobs'
      className='min-w-[300px] p-[22px] rounded-[20px] flex gap-[35px] items-center hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white to-red-50 border border-red-100 animate-scaleIn'
      style={{
        boxShadow: "0px 8px 24px rgba(227, 30, 36, 0.12)",
        animationDelay: '0ms'
      }}
    >
      <div className='bg-gradient-to-br from-[#E31E24] to-[#FF4B51] w-[95px] h-[95px] rounded-[16px] flex justify-center items-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
        <JobSearchIcon color='#FFFFFF' size={50} className='group-hover:rotate-12 transition-transform duration-300' />
      </div>
      <Box className='pr-[30px]'>
        <Loader isLoading={props.loading}>
          <p className='text-[16px] font-medium leading-6 text-gray-600 mb-1'>
            {t('allJobs')}
          </p>
        </Loader>
        <Loader isLoading={props.loading}>
          <p className='text-[36px] font-bold leading-10 text-gray-900'>
            {amount > 0 ? amount : (
              <span className='text-2xl text-gray-400'>0</span>
            )}
          </p>
        </Loader>
      </Box>
    </Box>
  );
};

OverviewAllJobs.propTypes = {
  amount: PropTypes.number.isRequired,
};
