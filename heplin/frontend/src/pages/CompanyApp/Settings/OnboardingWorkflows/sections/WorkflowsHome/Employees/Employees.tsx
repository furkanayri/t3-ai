import {
    Alert,
    Avatar,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDialog } from 'src/hooks/use-dialog';
import { useGetAllEmployeesQuery, useGetAllOnboardingWorkflowsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import AssignOnboarding from './AssignOnboarding';

export default function Employees() {
    const dialog = useDialog<any>();
    const { t } = useTranslation();
    const onboardingWorkflowsQuery = useGetAllOnboardingWorkflowsQuery();
    const employeesQuery = useGetAllEmployeesQuery('');

    const onboardingWorkflowsData = array<any>(onboardingWorkflowsQuery?.data?.results);

    const employeesData = array<any>(employeesQuery.data?.results);
    return (
        <>
            <AssignOnboarding
                onClose={(isSuccess) => {
                    isSuccess && employeesQuery.refetch();
                    dialog.handleClose();
                }}
                employeeId={dialog.data?.employeeId}
                employeeName={dialog.data?.employeeName}
            />
            <Stack
                flexDirection="row"
                flexWrap="wrap"
                gap={2}
            >
                {employeesQuery.isFetching ? (
                    <CircularProgress />
                ) : employeesData.length === 0 ? (
                    <Alert>{t('Not found any employee')}</Alert>
                ) : (
                    employeesData.map((employee) => {
                        const workflow = employee?.onboardingWorkflowId
                            ? onboardingWorkflowsData.find((d) => d?._id === employee?.onboardingWorkflowId)
                            : null;
                        return (
                            <Card
                                key={employee?._id}
                                sx={{ width: 200 }}
                            >
                                <Tooltip
                                    title={
                                        <Stack>
                                            <Typography>
                                                {employee?.name || '-'} {employee?.surname || '-'}
                                            </Typography>
                                            <Typography>{employee?.email}</Typography>
                                        </Stack>
                                    }
                                >
                                    <CardContent
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'column',
                                        }}
                                        className="group"
                                    >
                                        <Avatar
                                            src={employee?.avatar}
                                            sx={{ width: 40, height: 40 }}
                                        />
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ mt: 1, textOverflow: 'ellipsis', maxWidth: '100%', overflow: 'hidden' }}
                                        >
                                            {employee?.name || '-'} {employee?.surname || '-'}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color={'text.secondary'}
                                            sx={{ textOverflow: 'ellipsis', maxWidth: '100%', overflow: 'hidden' }}
                                        >
                                            {employee?.email}
                                        </Typography>
                                        {!employee?.onboardingWorkflowId ? (
                                            <Stack spacing={0.5}>
                                                <div className="flex items-center justify-center">
                                                    <Chip
                                                        sx={{ mt: 2 }}
                                                        label={t('No workflow')}
                                                        size="small"
                                                    />
                                                </div>
                                                <div>
                                                    <Button
                                                        className="invisible group-hover:visible"
                                                        sx={{ py: 0, fontSize: 12 }}
                                                        size="small"
                                                        onClick={() =>
                                                            dialog.handleOpen({
                                                                employeeId: employee?._id,
                                                                employeeName: `${employee?.name || '-'} ${employee?.surname || '-'
                                                                    }`,
                                                            })
                                                        }
                                                    >
                                                        {t('Assign Onboarding')}
                                                    </Button>
                                                </div>
                                            </Stack>
                                        ) : (
                                            <Stack spacing={0.5}>
                                                <div className="flex items-center justify-center">
                                                    <Chip
                                                        label={workflow?.title}
                                                        size="small"
                                                        sx={{ mt: 2 }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    {employee?.isOnboardCompleted ? (
                                                        <Chip
                                                            sx={{ fontSize: 12, background: 'rgb(240 253 244)' }}
                                                            size="small"
                                                            label={
                                                                <div className="flex items-center gap-x-1 bg-green-50">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                    <div>{t('Completed')}</div>
                                                                </div>
                                                            }
                                                        />
                                                    ) : (
                                                        <Chip
                                                            sx={{ fontSize: 12, background: 'rgb(254 252 232)' }}
                                                            size="small"
                                                            label={
                                                                <div className="flex items-center gap-x-1 bg-yellow-50">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                                                    <div>{t('Pending')}</div>
                                                                </div>
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </Stack>
                                        )}
                                    </CardContent>
                                </Tooltip>
                            </Card>
                        );
                    })
                )}
            </Stack>
        </>
    );
}
