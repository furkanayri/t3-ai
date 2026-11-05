import { Alert, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDialog } from 'src/hooks/use-dialog';
import { useGetAllTeamsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import CreateDepartment from './CreateTeam';
import UpdateDepartment from './UpdateTeam';
import { Add } from '@mui/icons-material';

export function ListTeams() {
    const { t } = useTranslation();
    const dialog = useDialog<any>();
    const teamsQuery = useGetAllTeamsQuery();

    const teamsData = array<any>(teamsQuery.data?.results);

    const handleClose = (isSuccess?: boolean) => {
        dialog.handleClose();
        if (isSuccess) {
            teamsQuery.refetch();
        }
    }

    return (
        <>
            <CreateDepartment isVisible={dialog.data?.mode === "create"} onClose={handleClose} />
            <UpdateDepartment id={dialog.data?.id} isVisible={dialog.data?.mode === "update"} onClose={handleClose} />
            <Stack flex={1}>
                <Stack
                    flexDirection={'row'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    gap={2}
                    mb={2}
                >
                    <Typography variant="h5">
                        {t('teams')}
                    </Typography> 
                    <Button
                        size="small"
                        onClick={() => dialog.handleOpen({ mode: 'create' })}
                        startIcon={<Add fontSize='small' />}
                    >
                        {t('new_team')}
                    </Button>
                </Stack>
                <Stack
                    flexDirection="row"
                    flexWrap="wrap"
                    gap={2}
                >
                    {teamsQuery.isLoading ? <CircularProgress /> : teamsData.length === 0 ? (
                        <Alert>{t('no_teams_found')}</Alert>
                    ) : (
                        teamsData.map((team) => {
                            return (
                                <Card
                                    key={team?._id}

                                >
                                    <CardContent
                                        onClick={() => dialog.handleOpen({ mode: 'update', id: team?._id })}
                                        sx={{ width: 215, textAlign: "center", cursor: "pointer", background: "#6366f114",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" }}
                                    >
                                        <Typography variant='subtitle1'>
                                            {team?.name}
                                        </Typography>
                                        <Typography variant='body2' color="text.secondary">
                                            {team?.employees?.length} member
                                        </Typography>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </Stack>
            </Stack>
        </>
    );
}
