import { Alert, Card, CardContent, CircularProgress, Divider, Stack } from '@mui/material';
import { useMemo, type FC } from 'react';
import MeetingCard from './MeetingCard';
import {
  useDeleteMeetingMutation,
  useGetAllMeetingsQuery,
  useUpdateMeetingMutation,
} from 'src/hooks/useServices/useMeetingServices';
import { useSnackbar } from 'notistack';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { Paginate } from 'src/components/shared';
import { useSearchParams } from "react-router-dom";

export const CompletedMeetingsTab: FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams()

  const pageSizes = [1, 6, 12]
  const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
  const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]
  const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])

  const completedMeetingsQuery = useGetAllMeetingsQuery({ query: `?status=completed&${query}` });
  const deleteMeetingMutation = useDeleteMeetingMutation();
  const updateMeetingMutation = useUpdateMeetingMutation();

  const completedMeetingsData = array<any>(completedMeetingsQuery.data?.results);
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteMeeting = async (id: string) => {
    deleteMeetingMutation.mutateAsync(
      { id },
      {
        onSuccess: (data) => {
          enqueueSnackbar(t('Meeting deleted.'), { variant: 'success' });
          completedMeetingsQuery.refetch();
        },
        onError: (err) => {
          enqueueSnackbar((err as any).message, { variant: 'error' });
        },
      }
    );
  };
  const handleUpdateMeeting = async (id: string, payload: any) => {
    updateMeetingMutation.mutateAsync(
      { id, payload },
      {
        onSuccess: (data) => {
          enqueueSnackbar(t('Meeting updated as upcoming.'), { variant: 'success' });
          completedMeetingsQuery.refetch();
        },
        onError: (err) => {
          enqueueSnackbar((err as any).message, { variant: 'error' });
        },
      }
    );
  };

  if (completedMeetingsQuery.isLoading) return <CircularProgress />;

  if (completedMeetingsQuery.isError)
    return <Alert severity="error">{(completedMeetingsQuery?.error as any)?.message}</Alert>;

  return (
    <>
      <Card>
        <CardContent>
          <Stack
            spacing={2}
            divider={<Divider />}
          >
            {completedMeetingsData.length === 0 ? (
              <Alert severity="warning">{t('Not found any completed meetings')}</Alert>
            ) : (
              <Paginate
                isFetching={completedMeetingsQuery.isFetching || completedMeetingsQuery.isPreviousData}
                pageSizes={pageSizes}
                count={completedMeetingsQuery?.data?.count}
              >
                {
                  completedMeetingsData.map((meeting: any, ind: number) => (
                    <MeetingCard
                      meeting={meeting}
                      deleteMeeting={handleDeleteMeeting}
                      updateMeeting={handleUpdateMeeting}
                      mode={'completed'}
                      key={meeting?._id + ind}
                    />
                  ))
                }
              </Paginate>
            )}

          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

export default CompletedMeetingsTab;
