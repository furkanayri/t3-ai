import type { FC } from 'react';
import { useState } from 'react';
import {
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Add, Edit } from '@mui/icons-material';
import { LanguageEditDrawer as EditDrawer } from './Components';
import { Language } from 'src/types/';
import { array } from 'src/utils';
import { useGetUserLanguagesQuery } from 'src/hooks/useServices/admin';
import { useParams } from 'react-router';

type DrawerMode = 'create' | 'edit';

const LanguageSettings: FC = () => {
  const { t } = useTranslation();
  const md = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const { id } = useParams()

  const languagesQuery = useGetUserLanguagesQuery(id ?? "");
  const languages = array(languagesQuery?.data?.results)

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState<Language>({} as Language);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');

  const handleDrawerOpen = async (data: Language, mode: DrawerMode) => {
    setData(data);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  return (
    <div
      id='account-languages'
      className='p-[32px] rounded-[13px]'
      style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
    >
      <div className='flex justify-between'>
        <p className="text text-xl font-semibold mb-5">
          {t('languages')}
        </p>
        <IconButton onClick={() => handleDrawerOpen({} as any, 'create')}>
          <Add fontSize="medium" />
        </IconButton>
      </div>
      <div className='flex gap-4'>
        <p className="text text-sm w-1/4">
          {t('List the languages you know here to increase your hiring chances!')}
        </p>
        <div className='grow flex flex-col gap-4'>
          {languages?.map((lang: any) => (
            <div key={lang._id}>
              <Stack
                key={lang._id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{lang.name.charAt(0).toUpperCase() + lang.name.slice(1)}</Typography>
                <IconButton onClick={() => handleDrawerOpen(lang, 'edit')}>
                  <Edit fontSize="small" />
                </IconButton>
              </Stack>
              <Typography
                gutterBottom
                variant="subtitle2"
              >
                · {t(lang.languageLevel)}
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
          refetch={languagesQuery.refetch}
        />
      </Drawer>
    </div>
  );
};

export default LanguageSettings;
