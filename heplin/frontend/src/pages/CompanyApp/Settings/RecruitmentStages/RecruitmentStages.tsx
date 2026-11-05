import { useMemo } from 'react';
import { Add, Delete, Edit, Settings } from '@mui/icons-material';
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useDeleteRecruitmentStageMutation,
  useGetAllRecruitmentStagesQuery,
  usePostNewRecruitmentStageMutation
} from 'src/hooks/useServices';
import RecruitmentStagesDialog from './RecruitmentStagesDialog';
import { useSnackbar } from 'notistack';
import { array } from 'src/utils';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { RecruitmentStagePayload } from 'src/types';
import { FormikHelpers, useFormik } from 'formik';
import * as yup from 'yup'
import { LoadingButton } from '@mui/lab';
import EmailConfigDialog from './EmailConfigDialog';
import { ConfirmAction, CustomButton, Paginate } from 'src/components/shared';
import { ProtectedRoute } from 'src/components/Permission';
import { maxWidth } from '@mui/system';
import { Delete01Icon, Edit02Icon, Layout3ColumnIcon, PencilEdit01Icon, Settings02Icon } from 'hugeicons-react';

const stageSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup.string(),
})

const initialValues: RecruitmentStagePayload = {
  title: "",
  description: "",
  stepsSort: [],
}

export default function () {
  const [searchParams, setSearchParams] = useSearchParams();

  const { enqueueSnackbar } = useSnackbar();
  const { t, i18n } = useTranslation()

  const pageSizes = [6, 12, 25]
  const page = useMemo(() => Number(searchParams.get('page')?.toString()), [searchParams]) || 0
  const limit = useMemo(() => Number(searchParams.get('limit')?.toString()), [searchParams]) || pageSizes[0]
  const query = useMemo(() => `page=${page + 1}&limit=${limit}`, [page, limit])

  const stagesQuery = useGetAllRecruitmentStagesQuery(query)
  const recruitmentStages = array(stagesQuery?.data?.results)

  const createRecruitmentStageMutation = usePostNewRecruitmentStageMutation()
  const deleteRecruitmentStageMutation = useDeleteRecruitmentStageMutation()

  const stageId = useMemo(() => searchParams.get('stageId'), [searchParams]);
  const detailsParam = useMemo(() => searchParams.get('details'), [searchParams]);
  const emailSettingsParam = useMemo(() => searchParams.get('emailSettings'), [searchParams]);

  const handleOpenDetails = (id: string) => {
    setSearchParams((prev) => {
      prev.set('details', 'open')
      prev.set('stageId', id);
      return prev;
    })
  };
  const handleOpenEmailSettings = (id: string) => {
    setSearchParams((prev) => {
      prev.set('emailSettings', 'open')
      prev.set('stageId', id);
      return prev;
    })
  };
  const onClose = () => {
    setSearchParams((prev) => {
      prev.delete('stageId');
      prev.delete('details');
      prev.delete('emailSettings');
      return prev;
    });
  };

  const handleCreateStage = (values: RecruitmentStagePayload, helpers: FormikHelpers<RecruitmentStagePayload>) => {
    createRecruitmentStageMutation.mutateAsync(values, {
      onSuccess: (data) => {
        enqueueSnackbar(t('Recruitment Stage was successfully created'), { variant: 'success' });
        enqueueSnackbar(t('You can edit this stage and add recruitment steps'), { variant: 'info' });
        stagesQuery.refetch()
        helpers.resetForm()
      },
      onError: (err) => {
        enqueueSnackbar((err as any).message ?? err, { variant: 'error' });
      },
    }
    )
  }
  const handleDeleteStage = (id: string) => {
    deleteRecruitmentStageMutation.mutateAsync({ id },
      {
        onSuccess: (data) => {
          enqueueSnackbar(t('Recruitment Stage was successfully deleted'), { variant: 'info' });
          stagesQuery.refetch()
        },
        onError: (err) => {
          enqueueSnackbar((err as any).message ?? err, { variant: 'error' });
        },
      },
    )
  }

  const { values, handleChange, handleBlur, errors, touched, handleSubmit, isSubmitting } = useFormik({
    initialValues,
    onSubmit: handleCreateStage,
    validationSchema: stageSchema
  });

  const isDetailsOpen = !!stageId && detailsParam === "open"
  const isEmailSettingsOpen = !!stageId && emailSettingsParam === "open"

  const toTitleCase = (text: string) => {
    return text.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  return (
    <ProtectedRoute permission="manage_recruitment_stage">
      <div className="pt-12 w-full max-w-4xl">
        <RecruitmentStagesDialog
          open={isDetailsOpen}
          closeDialog={onClose}
          refetchRecruitmentStages={stagesQuery?.refetch}
        />
        <EmailConfigDialog
          open={isEmailSettingsOpen}
          closeDialog={onClose}
        />
        <header className='mb-5'>
          <p className="text-[20px] text-[#5E5E5E] font-medium mb-5">{t('Recruitment Stages')}</p>
        </header>

        <div className='p-7' style={{
          boxShadow: '0px 4px 14.8px 0px #A6A6A640'
        }}>

          <form onSubmit={handleSubmit}>
            <div className='flex gap-2 mb-10 max-w-3xl' >
              <div className='grow'>
                <TextField
                  fullWidth
                  label={t("Title")}
                  name="title"
                  onChange={handleChange}
                  value={values.title ?? ''}
                  size="small"
                  onBlur={handleBlur}
                  error={touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                  required
                  inputProps={{ maxLength: 50 }}
                />
              </div>
              <div className='grow-[2]'>
                <TextField
                  fullWidth
                  label={t("description")}
                  name="description"
                  onChange={handleChange}
                  value={values.description ?? ''}
                  size="small"
                  onBlur={handleBlur}
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                  inputProps={{ maxLength: 100 }}
                />
              </div>
              <div className=''>
                <CustomButton
                  type="submit"
                  sx={{
                    height: '37px'
                  }}>
                  {isSubmitting ? <CircularProgress /> : t('Create')}
                </CustomButton>
              </div>
            </div>
            {
              recruitmentStages.length === 0 ?
                <div className='mt-4'>
                  <Alert severity='info'>{t('noTeamMembers')}</Alert>
                </div>

                :

                <Paginate
                  isFetching={stagesQuery.isFetching || stagesQuery.isPreviousData}
                  pageSizes={pageSizes}
                  count={stagesQuery?.data?.count}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{
                        "& .MuiTableCell-root": {
                          backgroundColor: 'transparent'
                        }
                      }}>
                        <TableCell></TableCell>
                        <TableCell sx={{ textTransform: 'capitalize  !important' }} ><p className='font-satoshi text-sm font-medium'>{t('Title')}</p></TableCell>
                        <TableCell sx={{ textTransform: 'capitalize  !important' }}><p className='font-satoshi text-sm font-medium'>{t('Steps')}</p></TableCell>
                        <TableCell sx={{ textTransform: 'capitalize  !important' }}><p className='font-satoshi text-sm font-medium'>{t('Description')}</p></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recruitmentStages?.map((stage: any) => {
                        const stepCountText = stage?.stepsSort?.length + " " + t("recruitmentStepsCount")

                        return (
                          <TableRow key={stage?._id}>
                            <TableCell sx={{ width: '16px', padding: 0 }}>
                              <Layout3ColumnIcon color='#E31E24' size={16} />
                            </TableCell>
                            <TableCell sx={{ wordBreak: "break-word" }}> <p className='font-satoshi font-bold text-sm'>{stage.title}</p> </TableCell>
                            <TableCell><p className='font-satoshi font-medium text-xs text-[#979797]'> {stage?.stepsSort?.length === 0 ? t("No steps added yet") : stepCountText}</p></TableCell>
                            <TableCell sx={{ maxWidth: "200px", wordBreak: "break-word" }}><p className='font-satoshi font-medium text-xs text-[#979797]'> {stage?.description}</p></TableCell>
                            <TableCell align='right'>
                              <div className='flex items-center justify-end gap-2'>
                                <Tooltip title={t("edit")}>
                                  <IconButton
                                    onClick={() => handleOpenDetails(stage?._id)}
                                    sx={{ "&:hover": { backgroundColor: "#fff" } }}
                                  >
                                    <Edit02Icon color='#141B34' size={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t("settings")}>
                                  <IconButton
                                    onClick={() => handleOpenEmailSettings(stage?._id)}
                                    sx={{ "&:hover": { backgroundColor: "#fff" } }}
                                  >
                                    <Settings02Icon color='#141B34' size={18} />
                                  </IconButton>
                                </Tooltip>
                                <ConfirmAction
                                  title={t('confirmDeletion')}
                                  description={t('confirmEmailTemplateDeletion')}
                                  onConfirm={async () => {
                                    handleDeleteStage(stage?._id)
                                  }}
                                >
                                  <Tooltip title={t("delete")}>
                                    <div className='p-[8px]'>
                                      <Delete01Icon size={18} color='#FD5F5F' />
                                    </div>
                                  </Tooltip>
                                </ConfirmAction>
                              </div>
                            </TableCell>
                          </TableRow>)
                      })}
                    </TableBody>
                  </Table>
                </Paginate>
            }
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
