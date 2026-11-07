import type { FC } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { RouterLink } from 'src/components/router-link';
import { Loader } from 'src/components/shared';
import { useTranslation } from 'react-i18next';
import { UserLove01Icon } from 'hugeicons-react';

interface OverviewAllCandidatesProps {
  amount: number;
  loading: boolean;
}

export const OverviewAllCandidates: FC<OverviewAllCandidatesProps> = (props) => {
  const { t } = useTranslation();
  const { amount } = props;

  return (
    <Box
      component={RouterLink}
      href='candidates'
      className='min-w-[300px] p-[22px] rounded-[20px] flex gap-[35px] items-center hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white to-blue-50 border border-blue-100 animate-scaleIn group'
      style={{
        boxShadow: "0px 8px 24px rgba(59, 130, 246, 0.12)",
        animationDelay: '100ms'
      }}
    >
      <div className='bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] w-[95px] h-[95px] rounded-[16px] flex justify-center items-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
        <UserLove01Icon color='#FFFFFF' size={50} className='group-hover:scale-110 transition-transform duration-300' />
      </div>
      <Box className='pr-[30px]'>
        <Loader isLoading={props.loading}>
          <p className='text-[16px] font-medium leading-6 text-gray-600 mb-1'>
            {t('allCandidates')}
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

OverviewAllCandidates.propTypes = {
  amount: PropTypes.number.isRequired,
};
