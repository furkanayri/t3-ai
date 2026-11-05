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
import { ExperienceDrawer } from './Components';
import { Experience } from 'src/types/';
import { useGetAllCandidateExperiencesQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { useSearchParams } from 'react-router-dom';

type DrawerMode = 'create' | 'edit';

export const ExperiencesSettings: FC = () => {
  { }
  const { t, i18n } = useTranslation();
  const md = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const [searchParams, setSearchParams] = useSearchParams()

  const experiencesQuery = useGetAllCandidateExperiencesQuery();

  const experiences = array(experiencesQuery?.data?.results)

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState<Experience>({} as Experience);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
  const dynamicLanguage = i18n.language
  const handleDrawerOpen = async (data: Experience, mode: DrawerMode) => {
    setData(data);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  return (
    <div
      id='account-experiences'
      className='p-[32px] rounded-[13px]'
      style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
    >
      <div className='flex  justify-between'>
        <p className="text text-xl font-semibold mb-5">
          {t('Experiences')}
        </p>
        <IconButton onClick={() => handleDrawerOpen({} as any, 'create')}>
          <Add fontSize="medium" />
        </IconButton>
      </div>
      <div className='flex gap-4'>
        <p className="hidden md:block text text-sm w-1/4">
          {t('List your experiences here to increase your hiring chances!')}
        </p>
        <div className='grow flex flex-col gap-4'>
          {experiences.map((exp: any) => (
            <div key={exp?._id}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{exp.title}</Typography>
                <IconButton onClick={() => handleDrawerOpen(exp, 'edit')}>
                  <Edit fontSize="small" />
                </IconButton>
              </Stack>

              <Typography
                gutterBottom
                variant="subtitle2"
              >
                {exp.company} · {t(exp.jobType)} · {t(exp.locationType)}
              </Typography>

              <Typography
                gutterBottom
                variant="subtitle2"
              >
                {formatMontYear(exp.startDate)} -{' '}
                {exp.isOngoing ? t('present') : formatMontYear(exp.endDate)}
              </Typography>

              <Typography variant="caption">
                {[exp?.country?.names?.[dynamicLanguage], exp.city, exp.district]
                  .filter(Boolean)
                  .join(', ')}
              </Typography>
              <Typography
                variant="body2"
                marginTop={1}
              >
                {exp.description}
              </Typography>
            </div>
          ))}
        </div>
      </div>
      <Drawer
        open={drawerOpen}
        onClose={() => {

          setDrawerOpen(false)
          setSearchParams((prev: any) => {
            prev.delete('countryId')
            return prev
          })
        }
        }
        anchor={md ? 'right' : 'bottom'}
        PaperProps={{
          sx: {},
        }}
        sx={{ flexShrink: 0 }}
      >
        <ExperienceDrawer
          data={data}
          mode={drawerMode}
          setDrawerOpen={setDrawerOpen}
          refetch={experiencesQuery.refetch}
        />
      </Drawer>
    </div>
  );
};

export default ExperiencesSettings;
