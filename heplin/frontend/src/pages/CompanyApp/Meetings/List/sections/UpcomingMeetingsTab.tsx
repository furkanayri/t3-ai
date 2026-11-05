import { Alert, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useMemo, type FC } from 'react';
import MeetingCard from '../../Components/MeetingCard';
import {
  useDeleteMeetingMutation,
  useGetAllMeetingsQuery,
  useUpdateMeetingMutation,
} from 'src/hooks/useServices/useMeetingServices';
import { useSnackbar } from 'notistack';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Paginate } from 'src/components/shared';

export const Tab: FC = () => {
  const { t } = useTranslation()

  const deleteMeetingMutation = useDeleteMeetingMutation();
  const updateMeetingMutation = useUpdateMeetingMutation();
  const [searchParams, setSearchParams] = useSearchParams()


  const pageSizes = [6, 12, 25, 50]
  const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
  const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]
  const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])

  const { enqueueSnackbar } = useSnackbar();

  const upcomingMeetingsQuery = useGetAllMeetingsQuery({ query: `?status=initial&${query}` });
  const upcomingMeetingsData = array(upcomingMeetingsQuery.data?.results);


  const handleDeleteMeeting = async (id: string) => {
    deleteMeetingMutation.mutateAsync(
      { id },
      {
        onSuccess: (data) => {
          enqueueSnackbar(t('Meeting deleted.'), { variant: 'success' });
          upcomingMeetingsQuery.refetch();
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
          enqueueSnackbar(t('Meeting updated as completed.'), { variant: 'success' });
          upcomingMeetingsQuery.refetch();
        },
        onError: (err) => {
          enqueueSnackbar((err as any).message, { variant: 'error' });
        },
      }
    );
  };

  if (upcomingMeetingsQuery.isLoading) return <CircularProgress />;

  if (upcomingMeetingsQuery.isError)
    return <Alert severity="error">{(upcomingMeetingsQuery?.error as any)?.message}</Alert>;

  return (
    <>
      <div className='py-[22px] rounded-[13px] mt-[20px]'
        style={{
          boxShadow: "0px 4px 14.8px 0px #A6A6A640"
        }}
      >
        {upcomingMeetingsData.length === 0 ? (
          <Alert severity="info">{t('No meetings added yet')}</Alert>
        ) : (
          <>
            <Paginate
              isFetching={upcomingMeetingsQuery.isFetching || upcomingMeetingsQuery.isPreviousData}
              pageSizes={pageSizes}
              count={upcomingMeetingsQuery?.data?.count}
            >
              <Table>
                <TableHead>
                  <TableRow
                    style={{ fontWeight: 500, fontSize: "14px" }}
                    sx={{
                      "& .MuiTableCell-root": {
                        fontSize: "14px",
                        fontWeight: "500",
                        fontFamily: "Satoshi, sans-serif",
                        textTransform: "capitalize",
                      }
                    }}
                  >
                    <TableCell align='center' width={40}>{t('date')}</TableCell>
                    <TableCell align='center' width={60}>{t('time')}</TableCell>
                    <TableCell align='center'>{t('jobPost')}</TableCell>
                    <TableCell align='center'>{t('candidate')}</TableCell>
                    <TableCell align='center' width={120}>{t('meetingType')}</TableCell>
                    <TableCell align='center'>{t('meetingHost')}</TableCell>
                    <TableCell align='center'></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    upcomingMeetingsData.map((meeting: any, ind: number) => (
                      <MeetingCard
                        meeting={meeting}
                        deleteMeeting={handleDeleteMeeting}
                        updateMeeting={handleUpdateMeeting}
                        mode={'upcoming'}
                        key={meeting?._id + ind}
                      />
                    ))
                  }
                </TableBody>
              </Table>
            </Paginate>
          </>
        )}
      </div>
    </>
  );
};

export default Tab;
