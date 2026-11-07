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
import { Add, Edit } from '@mui/icons-material';
import { SkillEditDrawer as EditDrawer } from './Components';
import { useGetAllCandidateSkillsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { Skill } from 'src/types/';
import { useParams } from 'react-router';
import { useGetUserSkillsQuery } from 'src/hooks/useServices/admin';

type DrawerMode = 'create' | 'edit';

const SkillSettings: FC = () => {
    const { t } = useTranslation();
    const md = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    const { id } = useParams();

    const skillsQuery = useGetUserSkillsQuery(id ?? "");
    const skills = array(skillsQuery.data?.results);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [data, setData] = useState<Skill>({} as Skill);
    const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');

    const handleDrawerOpen = async (data: Skill, mode: DrawerMode) => {
        setData(data);
        setDrawerMode(mode);
        setDrawerOpen(true);
    };

    return (
        <div
            id='account-skills'
            className='p-[32px] rounded-[13px]'
            style={{ boxShadow: "0px 4px 14.8px 0px #A6A6A640" }}
        >
            <div className='flex  justify-between'>
                <p className="text text-xl font-semibold mb-5">
                    {t('skills')}
                </p>
                {skills?.length === 0 && (
                    <IconButton onClick={() => handleDrawerOpen({} as any, 'create')}>
                        <Add fontSize="medium" />
                    </IconButton>
                )}
            </div>
            <div className='flex gap-4'>
                <p className="text text-sm w-1/4">
                    {t('List your skills here to increase your hiring chances!')}
                </p>
                <div className='grow flex flex-col gap-4'>
                    {skills?.map((skill: any) => (
                        <div key={skill._id}>
                            <Stack
                                key={skill._id}
                                direction="row"
                                gap={2}
                                alignItems="center"
                            >
                                {
                                    skill?.skills?.map((skill: any) => (
                                        <Typography key={skill._id} variant="h6">{skill?.name}</Typography>
                                    ))
                                }
                                <IconButton onClick={() => handleDrawerOpen(skill, 'edit')}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Stack>
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
                    refetch={skillsQuery.refetch}
                />
            </Drawer>
        </div >
    );
};

export default SkillSettings;
