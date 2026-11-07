import { MouseEventHandler, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContent,
  Dialog,
  DialogActions,
  Button,
  DialogTitle,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { format, intlFormatDistance, isValid } from 'date-fns';
import { useParams, useSearchParams } from 'react-router-dom';
import { ApplicantStatusChip } from './components';
import { DownloadCVButton } from 'src/components';
import { DisabledByDefault, Block } from '@mui/icons-material';
import {
  useCandidateBlackListsMutation,
  useDisqualifyJobApplicationMutation,
  useGetAllJobApplicationsQuery,
  useGetJobApplicationsExcelQuery,
  useGetMyEmployeeDataQuery,
  useGetOneEmployeeQuery,
  useUpdateApplicantReview,
} from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';
import { DisqualifyApplicationDialog } from './sections';
import DateRangePickerComp from './components/DateRangePickerComp';
import { addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
import { LoadingButton } from '@mui/lab';
import { Paginate } from 'src/components/shared';
import { Comment01Icon, InformationCircleIcon, ViewIcon, WhatsappIcon } from 'hugeicons-react';
import CandidateCommentDrawer from './sections/JobOverview/sections/CandidateCommentDrawer';
import { useDialog } from 'src/hooks/use-dialog';
import { KeyboardEvent } from 'react';
import { useCandidateDetail } from './sections/CandidateApplicantDetail/CandidateApplicantDetail';
import { BlacklistCandidateDialog } from './components/BlackListCandidateDialog';
import DescriptionIcon from '@mui/icons-material/Description';
import { getJobApplicationsExcelService } from 'src/services';
export function Component() {
  const { t } = useTranslation();
  const { id } = useParams();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ]);
  const [isTime, setIsTime] = useState('all');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [commentDrawer, setCommentDrawer] = useState(false)
  const [disqualifyData, setDisqualifyData] = useState({ applicationId: '', candidateId: '' });
  const [isBlacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [blacklistData, setBlacklistData] = useState({ applicationId: '', candidateId: '' });

  const disqualifyMutation = useDisqualifyJobApplicationMutation();
  const candidateBlackList = useCandidateBlackListsMutation();

  const activeCandidateId = searchParams.get('candidateId');
  const jobId = params?.id;
  const employeeDataQuery = useGetMyEmployeeDataQuery();
  const { isSeen } = useCandidateDetail()
  const updateApplicantMutation = useUpdateApplicantReview()

  const openApplicantDetail = (candidateId: string, applicationId: string) => {

    setSearchParams((prev) => {
      prev.set('candidateId', candidateId);
      return prev;
    });
    const payload = {
      viewedBy: employeeDataQuery?.data?.employee?._id,
      operation: 'add'

    }


  };

  const handleClickDisqualify = (data: { applicationId: string; candidateId: string }) => {
    setDialogOpen(true);
    setDisqualifyData(data);
  };
  const handleClickBlacklist = (data: { applicationId: string; candidateId: string }) => {
    setBlacklistData(data);
    setBlacklistDialogOpen(true);
  };
  const handleSubmitBlacklist = async (reason: string) => {
    if (!jobId) return;
    const { candidateId, applicationId } = blacklistData;

    const payload = {
      candidateId,
      reason,
      applicationId,
    };

    return candidateBlackList.mutateAsync(
      { jobId, payload },
      {
        onSuccess: () => {
          enqueueSnackbar(t('The candidate has been blacklisted'), { variant: 'success' });
          refetch();
          setBlacklistDialogOpen(false);
        },
        onError: () => {
          enqueueSnackbar(t('An error occurred while blacklisting the candidate'), { variant: 'error' });
        },
      }
    );
  };


  const pageSizes = [6, 12, 25];
  const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0;
  const limit =
    useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0];
  const name = useMemo(() => searchParams.get('name')?.toString(), [searchParams]) || '';
  const status = useMemo(() => searchParams.get('status')?.toString(), [searchParams]) || '';
  const isAppliedViaWhatsapp = useMemo(() => searchParams.get('isAppliedViaWhatsapp')?.toString(), [searchParams]) || '';




  const query = useMemo(() => {
    let queryStr = '';
    if (name) queryStr += `&name=${name}`;
    if (status) queryStr += `&status=${status}`;
    if (isAppliedViaWhatsapp) queryStr += `&isAppliedViaWhatsapp=${true}`
    if (isTime === 'specific')
      queryStr += `&startDate=${formatISO(startOfDay(range[0].startDate))}&endDate=${formatISO(
        endOfDay(range[0].endDate)
      )}`;
    return queryStr;
  }, [name, status, isTime, isAppliedViaWhatsapp]);


  const { data, refetch, isFetching, isPreviousData } = useGetAllJobApplicationsQuery({
    jobId: id!,
    query: query,
    page,
    limit,
  });



  const handleExcelExport = async () => {
    try {
      const blob = await getJobApplicationsExcelService({
        jobId: id!,
        query: `${query}&format=excel`,
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'basvurular.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Excel indirilemedi:', error);
    }
  };


  const handleSubmitDisqualify = async (disqualifyReason: string) => {
    if (!jobId) return;
    const { applicationId, candidateId } = disqualifyData;

    const payload = {
      applicationId,
      candidateId,
      disqualifyReason,
    };

    return disqualifyMutation.mutateAsync(
      { jobId, payload },
      {
        onSuccess: (data) => {
          enqueueSnackbar(t('Application disqualified'), { variant: 'success' });
          refetch();
          setDialogOpen(false);
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.message, { variant: 'error' });
        },
      }
    );

  };

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Enter') {
        refetch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchParams]);

  return (
    <>
      <DisqualifyApplicationDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (reason) => {
          handleSubmitDisqualify(reason);
        }}
      />
      <Box sx={{ mb: 4 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 2,
          borderBottom: '2px solid #f0f0f0'
        }}>
          <Box sx={{
            width: 4,
            height: 28,
            backgroundColor: '#E31E24',
            borderRadius: 1
          }} />
          <Typography variant="h5" sx={{
            fontWeight: 600,
            color: '#1a1a1a',
            fontSize: '1.5rem'
          }}>
            Tüm Başvuranlar
          </Typography>
        </Box>
      </Box>
      <Box
        display={'flex'}
        gap={'15px'}
        alignItems={'center'}
        sx={{
          backgroundColor: 'white',
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
          mb: 3
        }}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            sx={{ width: '100%' }}
            id="outlined-basic"
            label={t('name')}
            size='small'
            variant="outlined"
            value={name}
            onChange={(e) =>
              setSearchParams((prev) => {
                prev.set('name', e.target.value);
                return prev;
              })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') refetch();
            }}
          />
        </Box>
        <Box sx={{ minWidth: '250px' }}>
          <FormControl sx={{ width: '100%' }}>
            <InputLabel id="demo-simple-select-label">{t('time')}</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={isTime}
              label="status"
              size='small'
              onChange={(e) => setIsTime(e.target.value)}
            >
              <MenuItem value={'all'}>{t('all')}</MenuItem>
              <MenuItem value={'specific'}>{t('specificTime')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isTime == 'specific' ? (
          <DateRangePickerComp
            setRange={setRange}
            range={range}
          />
        ) : null}
        <Box sx={{ minWidth: '250px' }}>
          <FormControl sx={{ width: '100%' }}>
            <InputLabel id="demo-simple-select-label">{t('status')}</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              size='small'
              value={searchParams.get('status') || 'applied'}
              label="status"
              onChange={(e) =>
                setSearchParams((prev) => {
                  prev.set('status', e.target.value);
                  return prev;
                })
              }
            >
              <MenuItem value={'applied'}>{t('Ongoing')}</MenuItem>
              <MenuItem value={'disqualified'}>{t('Disqualified')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              size='small'
              onChange={(e) => {
                setSearchParams((prev) => {
                  prev.set('isAppliedViaWhatsapp', String(e.target.checked));
                  if (!e.target.checked) {
                    prev.delete('isAppliedViaWhatsapp');
                  }
                  return prev;
                })
              }
              }
              color="primary"
            />
          }
          label={
            <Tooltip title={t('applyWithWp')}>
              <WhatsappIcon
                size={24}
                color={"#000000"}
              />
            </Tooltip>
          }
        />
        <LoadingButton
          loading={isFetching}
          variant="contained"
          onClick={() => refetch()}
          sx={{
            backgroundColor: '#E31E24',
            color: 'white',
            fontWeight: 600,
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#C41B20',
            },
          }}
        >
          {t('filter')}
        </LoadingButton>
        <Tooltip title={t('exportExcel')}>
          <IconButton
            onClick={() => handleExcelExport()}
          >
            <DescriptionIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </Box>

      <Paginate
        isFetching={isFetching || isPreviousData}
        pageSizes={pageSizes}
        count={data?.count}
      >
        <Card sx={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
          overflow: 'hidden'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600, color: '#666' }}>ADAY</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666' }}>DURUM</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666' }}>BAŞVURU TARİHİ</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666' }}>DURUMU</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#666' }}>İŞLEMLER</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.results?.length ? (
                data?.results
                  .map((application: any) => {
                    return (
                      <TableRow

                        onClick={(e) => {
                          e.stopPropagation();
                          openApplicantDetail(application?.candidateId?._id, application?._id);
                        }}
                        key={application?._id}
                        sx={{
                          cursor: 'pointer',
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: application?.viewedBy?.some((v: any) => v?.employeeId === employeeDataQuery?.data?.employee?._id && v.isSeen) ? '#FFFFFF' : '#f8f9fa',
                          transition: 'all 200ms',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          }
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-x-2">
                            <Avatar src={application.candidateId?.userId?.avatar}>
                              {application?.candidateId?.name?.[0]}
                              {application?.candidateId?.surname?.[0]}

                            </Avatar>
                            <Typography
                              // fontWeight={ ? 'bold' : 'thin'}
                              sx={{
                                cursor: 'pointer',
                              }}
                              variant={application?.viewedBy?.some((v: any) => v?.employeeId === employeeDataQuery?.data?.employee?._id && v.isSeen) ? 'subtitle2' : 'body1'}
                            >
                              {application?.candidateId?.name} {application?.candidateId?.surname}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ApplicantStatusChip
                            status={application?.currentRecruitmentStepId?.title}
                          />
                        </TableCell>

                        <TableCell>
                          <Tooltip
                            title={
                              isValid(new Date(application.createdAt))
                                ? format(new Date(application.createdAt), 'yyyy.MM.dd kk:mm')
                                : null
                            }
                          >
                            <Typography
                              color="text.secondary"
                              sx={{ mt: 1 }}
                              //TODO added will be detailJopProvider
                              variant={application?.viewedBy?.some((v: any) => v.employeeId === employeeDataQuery?.data?.employee?._id && v.isSeen) ? 'subtitle2' : 'body1'}
                              className="capitalize"
                            >
                              {isValid(new Date(application.createdAt))
                                ? intlFormatDistance(new Date(application.createdAt), new Date(), {
                                  numeric: 'always',
                                })
                                : null}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          {application?.status === 'disqualified' ? (
                            <Chip
                              color="error"
                              label={t('Disqualified')}
                            />
                          ) : (
                            <Chip label={t('Ongoing')} />
                          )}
                        </TableCell>
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Tooltip title={t('Download CV')}>
                            <div>
                              <DownloadCVButton
                                fileName={`${application.candidateId?.name}-${application.candidateId?.surname}-cv.pdf`}
                                id={application.cv}
                              />
                            </div>
                          </Tooltip>

                          {
                            application?.status === 'disqualified' ?
                              <DisqualifySection reason={application?.disqualifyReason} /> :
                              <Tooltip title={t('Disqualify this application')}>
                                <div>
                                  <IconButton
                                    onClick={() => {
                                      handleClickDisqualify({
                                        applicationId: application?._id,
                                        candidateId: application?.candidateId?._id,
                                      });
                                    }}
                                    disabled={application?.status === 'disqualified'}
                                  >
                                    <DisabledByDefault />
                                  </IconButton>
                                </div>
                              </Tooltip>
                          }
                          {
                            <Tooltip title={t('Blacklist this candidate')}>
                              <div>
                                <IconButton
                                  onClick={() => {
                                    handleClickBlacklist({
                                      candidateId: application?.candidateId?._id,
                                      applicationId: application?._id,
                                    });
                                  }}
                                  disabled={application?.candidateId?.isBlackList}
                                >
                                  <Block color={application?.candidateId?.isBlackList ? 'error' : 'disabled'} />
                                </IconButton>
                              </div>
                            </Tooltip>
                          }
                          {/* 
                    //TODO: add more options menu
                    <IconButton>
                      <MoreVertOutlined />
                    </IconButton> 
                    */}
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <p>{t('There are no applications')}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Paginate>
      <BlacklistCandidateDialog
        isOpen={isBlacklistDialogOpen}
        onClose={() => setBlacklistDialogOpen(false)}
        onSubmit={handleSubmitBlacklist}
      />
    </>
  );
}

Component.displayName = 'JobApplicants';



function DisqualifySection({ reason }: { reason: any }) {
  const { data, handleClose, handleOpen, open } = useDialog<any>();

  const { t } = useTranslation()
  const handleDisqualifyReason = () => {
    handleOpen()
  }
  return (
    <>
      <Dialog sx={{
        maxWidth: 'xs',
      }}
        onClose={handleClose} open={open} >
        <DialogTitle>
          {t('disqualifyReason')}
        </DialogTitle>
        <DialogContent sx={{
          width: '400px'
        }}>
          <p className='text-left'> {reason}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined'>
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip title={t('See The Reason')}>
        <div>
          <IconButton onClick={handleDisqualifyReason}>
            <ViewIcon size={18} />
          </IconButton>
        </div>
      </Tooltip>
    </>
  )
}