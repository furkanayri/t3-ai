import { ArrowBack, Forward } from '@mui/icons-material';
import {
    Alert,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAllOnboardingResponsesQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import DetailResponse from './DetailResponse';

export default function ListResponses({
    workflowId,
    goBack,
}: {
    workflowId: string;
    goBack: () => void;
}) {
    const [activeResponseDetailId, setActiveResponseDetailId] = useState<null | string>(null);

    const responsesQuery = useGetAllOnboardingResponsesQuery(`onboardingWorkflowId=${workflowId}`);

    const responses = array<any>(responsesQuery.data?.results);
    const { t } = useTranslation();

    if (activeResponseDetailId)
        return (
            <DetailResponse
                goBack={() => setActiveResponseDetailId(null)}
                responseId={activeResponseDetailId}
                onUpdateSuccess={() => responsesQuery.refetch()}
            />
        );

    return (
        <Stack
            flex={1}
            spacing={2}
        >
            <header className="flex items-center gap-x-2">
                <IconButton
                    size="small"
                    onClick={goBack}
                >
                    <ArrowBack fontSize="small" />
                </IconButton>
                <Typography variant="h6">{t('onboarding_responses')}</Typography>
            </header>
            <Divider sx={{ borderColor: 'lightgray' }} />
            <Card>
                {responsesQuery.isLoading ? (
                    <CircularProgress />
                ) : responses.length === 0 ? (
                    <Alert>{t('not_found_any_response')}</Alert>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('Employee')}</TableCell>
                                <TableCell>{t('Date')}</TableCell>
                                <TableCell align='left'>{t('Status')}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {responses?.map((res) => {
                                const createdDate = new Date(res?.createdAt);
                                return (
                                    <TableRow
                                        key={res._id}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            transition: 'all 200ms',
                                        }}
                                        onClick={() => {
                                            setActiveResponseDetailId(res?._id)
                                        }}
                                    >
                                        <TableCell width={500}>
                                            <div className="flex items-center gap-x-2">
                                                <Typography
                                                    sx={{ cursor: 'pointer' }}
                                                    variant="subtitle1"
                                                >
                                                    {res?.employeeId?.name} {res?.employeeId?.surname}
                                                </Typography>
                                                <div className="flex-grow" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={createdDate.toLocaleString()}>
                                                <Typography>{createdDate.toLocaleDateString()}</Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align='left' width={100}>
                                            <Chip label={t(res?.status)} />
                                        </TableCell>
                                        <TableCell align='right'>
                                            <Button size="small">
                                                {t("Detail")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </Stack>
    );
}
