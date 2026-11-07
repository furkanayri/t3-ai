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
import { EducationEditDrawer as EditDrawer } from './Components';
import { Education } from 'src/types/';
import { useGetAllCandidateEducationsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';

type DrawerMode = 'create' | 'edit';

const EducationSettings: FC = () => {
  const { t } = useTranslation();

  const educationsQuery = useGetAllCandidateEducationsQuery();
  const educations = array(educationsQuery?.data?.results)
  const md = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState<Education>({} as Education);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');

  const handleDrawerOpen = async (data: Education, mode: DrawerMode) => {
    setData(data);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  return (
    <div
      id='account-education'
      className='p-[32px] rounded-[13px]'
      style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
    >
      <div className='flex justify-between'>
        <p className="text text-xl font-semibold mb-5">
          {t('Educations')}
        </p>
        <IconButton onClick={() => handleDrawerOpen({} as any, 'create')}>
          <Add fontSize="medium" />
        </IconButton>
      </div>
      <div className='flex gap-4'>
        <p className="hidden md:block text text-sm w-1/4">
          {t('List your education history here to increase your hiring chances!')}
        </p>
        <div className='grow flex flex-col gap-4'>
          {educations?.map((edu: any) => (
            <div key={edu._id}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{edu.institution}</Typography>
                <IconButton onClick={() => handleDrawerOpen(edu, 'edit')}>
                  <Edit fontSize="small" />
                </IconButton>
              </Stack>

              <Typography gutterBottom variant="subtitle2">
                {[edu.degree, edu.major].filter(Boolean).join(' · ')}
              </Typography>

              <Typography
                gutterBottom
                variant="subtitle2"
              >
                {formatMontYear(edu.startDate)} -{' '}
                {edu.isOngoing ? t('present') : formatMontYear(edu.endDate)}
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
          refetch={educationsQuery.refetch}
        />
      </Drawer>
    </div>
  );
};

export default EducationSettings;
