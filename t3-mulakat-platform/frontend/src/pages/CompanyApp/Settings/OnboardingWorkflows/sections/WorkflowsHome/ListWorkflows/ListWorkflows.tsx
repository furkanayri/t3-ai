import {
    Alert,
    Card,
    CardContent,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmAction, Paginate } from 'src/components/shared';
import {
    useDeleteOnboardingWorkflowMutation,
    useGetAllOnboardingWorkflowsQuery,
} from 'src/hooks/useServices';
import { array } from 'src/utils';
import { ListResponses } from './Responses';
import { useSearchParams } from 'react-router-dom';
import { Delete01Icon } from 'hugeicons-react';

//TODO: offboard işleminde ik elemanı file ekleyecek - işten çıkış belgesi gibi

export default function ListWorkflows({ openUpdate, }: { openUpdate: (id: string) => void }) {
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeWorkflowIdForResponse, setActiveWorkflowIdForResponse] = useState<string | null>(
        null
    );

    const pageSizes = [6, 12, 25]
    const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
    const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]

    const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])

    const listWorkflowsQuery = useGetAllOnboardingWorkflowsQuery(query);
    const deleteWorkflowMutation = useDeleteOnboardingWorkflowMutation();
    const { t } = useTranslation();

    const { enqueueSnackbar } = useSnackbar();

    const results = array<any>(listWorkflowsQuery.data?.results);

    const handleDelete = async (id: string) => {
        deleteWorkflowMutation.mutate(
            { id },
            {
                onSuccess: () => {
                    listWorkflowsQuery.refetch();
                },
                onError: (error: any) => {
                    enqueueSnackbar({
                        message: error?.response?.data?.message || error?.message,
                        variant: 'error',
                    });
                },
            }
        );
    };

    if (activeWorkflowIdForResponse)
        return (
            <ListResponses
                goBack={() => setActiveWorkflowIdForResponse(null)}
                workflowId={activeWorkflowIdForResponse}
            />
        );

    return (
        <Stack
            flex={1}
            spacing={2}
        >
            {!listWorkflowsQuery.isLoading && results.length === 0 ? (
                <Alert severity='info'>{t('thereAreNoOnboardingWorkflowsYet')}</Alert>
            ) : (
                <Paginate
                    count={listWorkflowsQuery.data?.count}
                    isFetching={listWorkflowsQuery?.isFetching || listWorkflowsQuery?.isPreviousData}
                    pageSizes={pageSizes}
                >

                    {results?.map((workflow) => {
                        return (
                            <Card key={workflow._id}>
                                <CardContent>
                                    <Stack
                                        flexDirection={'row'}
                                        justifyContent={'space-between'}
                                        alignItems={'center'}
                                    >
                                        <Stack
                                            spacing={1}
                                            flex={1}
                                            onClick={() => openUpdate(workflow._id)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <Typography variant="subtitle1">{workflow.title}</Typography>
                                            <Typography
                                                variant="body2"
                                                color={'text.secondary'}
                                            >
                                                {workflow?.description || t('no_description')}
                                            </Typography>
                                        </Stack>
                                        <div>
                                            <ConfirmAction
                                                onConfirm={() => {
                                                    return handleDelete(workflow._id);
                                                }}
                                            >
                                                <Tooltip title={t('delete')}>
                                                    <div className='p-[8px]'>
                                                        <Delete01Icon size={18} color='#FD5F5F' />
                                                    </div>
                                                </Tooltip>
                                            </ConfirmAction>
                                        </div>
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Paginate>
            )}
        </Stack>
    );
}
