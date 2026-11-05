import type { FC } from 'react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatMontYear } from 'src/utils/date-format';
import { Add, Edit } from '@mui/icons-material';
import { CertificateDrawer as EditDrawer } from './Components';
import { useGetAllCandidateCertificatesQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { Certificate } from 'src/types/Certificate';

type DrawerMode = 'create' | 'edit';

const CertificateSettings: FC = () => {
  const { t } = useTranslation();

  const certificateQuery = useGetAllCandidateCertificatesQuery();
  const certificates = array(certificateQuery?.data?.results);
  const md = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState<Certificate>({} as Certificate);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');

  const handleDrawerOpen = async (data: Certificate, mode: DrawerMode) => {
    setData(data);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  return (
    <div
      id='account-certificates'
      className='p-[32px] rounded-[13px]'
      style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
    >
      <div className='flex justify-between'>
        <p className="text text-xl font-semibold mb-5">
          {t('certificates')}
        </p>
        <IconButton onClick={() => handleDrawerOpen({} as any, 'create')}>
          <Add fontSize="medium" />
        </IconButton>
      </div>
      <div className='flex gap-4'>
        <p className="hidden md:block text text-sm w-1/4">
          {t('List your certificates history here to increase your hiring chances!')}
        </p>
        <div className='grow flex flex-col gap-4'>
          {certificates?.map((cer: any) => (
            <div key={cer._id}>
              <Stack
                key={cer._id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{cer?.institution}</Typography>
                <IconButton onClick={() => handleDrawerOpen(cer, 'edit')}>
                  <Edit fontSize="small" />
                </IconButton>
              </Stack>

              <Typography gutterBottom variant="subtitle2">
                {[cer.degree, cer.major].filter(Boolean).join(' · ')}
              </Typography>
              <Typography
                gutterBottom
                variant="subtitle2"
              >
                {formatMontYear(cer.startDate)} -{' '}
                {cer.isOngoing ? t('present') : formatMontYear(cer.endDate)}
              </Typography>
            </div>
          ))}
        </div>
      </div>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        anchor={md ? 'right' : 'bottom'}
        sx={{ flexShrink: 0 }}
      >
        <EditDrawer
          data={data}
          mode={drawerMode}
          setDrawerOpen={setDrawerOpen}
          refetch={certificateQuery.refetch}
        />
      </Drawer>
    </div >
  );
};

export default CertificateSettings;
