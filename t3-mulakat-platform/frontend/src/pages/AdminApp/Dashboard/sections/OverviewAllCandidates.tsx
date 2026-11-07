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
      className='min-w-[300px] p-[22px] rounded-[13px] flex gap-[35px] items-center'
      style={{
        boxShadow: "0px 4px 14.8px 0px #A6A6A640"
      }}
    >
      <div className='bg-[#EDFAFF] w-[95px] h-[95px] rounded-[5px] flex justify-center items-center'>
        <UserLove01Icon color='#E31E24' size={50} />
      </div>
      <Box className='pr-[30px]'>
        <Loader isLoading={props.loading}>
          <p className='text-[20px] font-medium leading-7'>
            {t('allCandidates')}
          </p>
        </Loader>
        <Loader isLoading={props.loading}>
          <p className='text-[30px] font-medium leading-10 text-center'>
            {amount}
          </p>
        </Loader>
      </Box>
    </Box>
  );
};

OverviewAllCandidates.propTypes = {
  amount: PropTypes.number.isRequired,
};
