import {
  Stack,
  Typography,
  IconButton,
  alpha,
} from '@mui/material';
import { ShowIfExist } from 'src/components';
import { useJobDetail } from '../context';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useNavigate } from "react-router-dom";
import { ArrowLeft01Icon } from 'hugeicons-react';
import { useTranslation } from 'react-i18next';
export default function PageHeader() {
  const navigate = useNavigate();
  const { job } = useJobDetail()
  const { t } = useTranslation()
  const handleBackPage = () => {
    navigate(-1)
  }
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 99,
        paddingBlock: '1rem',
        backdropFilter: 'blur(6px)',
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
      }}
    >
      <div className="flex items-center gap-x-4">
        <div className='flex gap-5'>
          <div>
            <IconButton size='large' onClick={() => handleBackPage()} aria-label="delete">
              <ArrowLeft01Icon />
            </IconButton>
          </div>
          <div className='flex flex-col'>
            <p className='text-[24px] font-medium'>
              {job?.title}
            </p>
            <div className="flex items-center gap-x-2 pt-2">
              <div>{job?.city}</div>
              <div></div>
              <div className="flex items-center gap-x-2">


                <ShowIfExist
                  render={(children) => <div>{children}</div>}
                >
                  {t(job?.locationType)}
                </ShowIfExist>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Stack
        justifyContent="flex-end"
        alignItems={'center'}
        direction="row"
        spacing={2}
      >
      </Stack>
    </Stack>
  );
}

