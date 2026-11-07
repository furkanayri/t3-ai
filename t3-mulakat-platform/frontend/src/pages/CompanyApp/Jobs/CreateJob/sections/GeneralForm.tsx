import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGetAllRecruitmentStagesQuery, useGetAllEmployeesQuery, usePostNewTenantCategoriesMutation, useGetAllCategoriesQuery, usePostAiContentJobMutation } from 'src/hooks/useServices';
import type { JobGeneralInfoForm } from 'src/types/jobPost';
import { array } from 'src/utils';
import { DatePicker } from '@mui/x-date-pickers';
import { Employee, RecruitmentStage } from 'src/types';
import AddIcon from '@mui/icons-material/Add';
import CreateDepartment from 'src/pages/CompanyApp/Teams/sections/Departments/CreateDepartment';

import { useDialog } from 'src/hooks/use-dialog';
import CreateTeam from 'src/pages/CompanyApp/Teams/sections/Teams/CreateTeam';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Categories } from 'src/types/Categories';
import { useAuth } from 'src/providers';
import { LoadingButton } from '@mui/lab';
import { MagicWand01Icon } from 'hugeicons-react';
const jobTypes = [
  {
    label: 'fulltime',
    value: 'fulltime',
  },
  {
    label: 'parttime',
    value: 'parttime',
  },
  {
    label: 'contract',
    value: 'contract',
  },
  {
    label: 'temporary',
    value: 'temporary',
  },
  {
    label: 'voluntary',
    value: 'voluntarily',
  },
  {
    label: 'intern',
    value: 'intern',
  },
  {
    label: 'other',
    value: 'other',
  },
];
export default function GeneralForm() {
  const { t } = useTranslation();
  const { values, handleBlur, handleChange, errors, touched, setFieldValue } = useFormikContext<JobGeneralInfoForm>();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [description, setDescription] = useState('');
  const dialogDepartment = useDialog<any>();
  const dialogTeam = useDialog<any>();
  const categoriesQuery = useGetAllCategoriesQuery(`status=active`);
  const categories = array<Categories>(categoriesQuery?.data?.results);
  const recruitmentStagesQuery = useGetAllRecruitmentStagesQuery();

  const recruitmentStages = array<RecruitmentStage>(recruitmentStagesQuery?.data?.results).filter((stage: any) => stage.stepsSort && stage.stepsSort.length);
  const postCategory = usePostNewTenantCategoriesMutation();
  const postAiContentJob = usePostAiContentJobMutation();
  const { activeTenantId } = useAuth()
  const handleOpen = () => {
    setOpen(true);
    setName('');
    setDescription('');
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSave = async () => {
    await postCategory.mutateAsync(
      {
        payload: { name, description, status: 'pending', tenantId: activeTenantId ?? '' },
      },
      {
        onSuccess: () => {
          categoriesQuery.refetch();
          enqueueSnackbar(t('Category addition request sent to administrator'), { variant: 'success' });
          handleClose();
        },
        onError: (error: unknown) => {
          const errorMessage = (error as { message: string }).message;
          return enqueueSnackbar(errorMessage, { variant: 'error' });
        },
      }
    );
  };

  const employeesQuery = useGetAllEmployeesQuery('')
  const employees = array<Employee>(employeesQuery.data?.results)
  const handleAiButtonClick = async (language: any) => {
    setAnchorEl(null);
    await postAiContentJob.mutateAsync(
      {
        title: values.title,
        language: language,
      },
      {
        onSuccess: (response) => {
          setFieldValue('content', response.description);
          setFieldValue('aiContent', "yes");
          enqueueSnackbar(t('Job description created successfully'), { variant: 'success' });
        },
        onError: (error: any) => {
          const errorMessage = (error?.message) || t("Job description could not be created.");
          enqueueSnackbar(errorMessage, { variant: 'error' });
        },
      }
    );
  };


  return (
    <>
      <CreateDepartment isVisible={dialogDepartment.data?.mode === "create"} onClose={dialogDepartment.handleClose} />
      <CreateTeam isVisible={dialogTeam.data?.mode === "create"} onClose={dialogTeam.handleClose} />
      <Card>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
              md={4}
            >
              <Typography variant="h6">{t('generalInfo')}</Typography>
              <Typography
                mt={2}
                color="text.secondary"
                variant="body2"
              >
                {t('defineTitleOfTheJob_selectDepartment')}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={8}
            >
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    required
                    label={t('jobTitle')}
                    name="title"
                    value={values.title ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && !!errors.title}
                    helperText={touched.title && errors.title ? t(errors.title) : ''}
                    sx={{ flexGrow: 1 }}
                  />
                  <LoadingButton
                    sx={{ gap: 1 }}
                    onClick={(event: any) => setAnchorEl(event.currentTarget)}
                    variant="contained"
                    loading={postAiContentJob.isLoading}
                  >
                    <MagicWand01Icon size={24} color={"#000000"} />
                    <Typography>{`T3 AI`}</Typography>
                  </LoadingButton>
                </Stack>
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  PaperProps={{
                    sx: {
                      width: '300px',
                    },
                  }}
                >
                  <Stack spacing={1} sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {t("Which language would you like to create the job description in")}
                    </Typography>
                    <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button variant="outlined" onClick={() => handleAiButtonClick('tr')}>
                        {t("turkish")}
                      </Button>
                      <Button variant="outlined" onClick={() => handleAiButtonClick('en')}>
                        {t("english")}
                      </Button>
                    </Stack>
                  </Stack>
                </Popover>

                <div className='flex items-center justify-center'>
                  <Stack sx={{ width: '100%', maxHeight: 57 }} >
                    <TextField
                      fullWidth
                      label={t('categories')}
                      name="categoryId"
                      value={values.categoryId ?? ''}
                      onChange={(e) => {
                        const selectedCategoryId = e.target.value;
                        handleChange(e);
                        setFieldValue('categoryId', selectedCategoryId);
                      }}
                      onBlur={handleBlur}
                      error={touched.categoryId && !!errors.categoryId}
                      select
                      required
                    >
                      {categories.map((category: any) => (
                        <MenuItem key={category?._id} value={category?._id}>
                          {category?.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Typography textAlign={'end'} variant="caption" color="red">{touched.categoryId && errors.categoryId ? t(errors.categoryId) : ""}</Typography>
                  </Stack>
                  <IconButton onClick={handleOpen}>
                    <AddIcon />
                  </IconButton>
                </div>
                <Stack>
                  <Autocomplete
                    fullWidth
                    disablePortal
                    options={employees?.map(e => e?._id) ?? []}
                    value={values.hiringTeams ?? []}
                    onChange={(event: any, value: any) => {
                      setFieldValue('hiringTeams', value)
                    }}
                    getOptionLabel={(opt) => {
                      const employee = employees.find(e => e._id === opt)
                      return `${employee?.name} ${employee?.surname}`
                    }}
                    renderInput={(params: any) => <TextField {...params} label="Hiring" />}
                    multiple

                  />
                </Stack>
                <Stack>
                  <TextField
                    fullWidth
                    label={t('Recruitment Stages')}
                    name="recruitmentStageId"
                    value={values.recruitmentStageId ?? null}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.recruitmentStageId && !!errors.recruitmentStageId}
                    helperText={touched.recruitmentStageId && errors.recruitmentStageId}
                    select
                    required
                  >
                    {recruitmentStages.map((stage: any) => (
                      <MenuItem
                        key={stage?._id}
                        value={stage?._id}
                      >
                        {stage?.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Stack>
                  <TextField
                    fullWidth
                    label={t('jobType')}
                    name="jobType"
                    value={values.jobType ?? null}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.jobType && !!errors.jobType}
                    helperText={touched.jobType && errors.jobType}
                    select
                    required
                  >
                    {jobTypes.map((jobType) => (
                      <MenuItem
                        key={jobType.value}
                        value={jobType.value}
                      >
                        {t(jobType.label)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Stack>
                  <DatePicker
                    disablePast
                    label={t('jobAdEndDate')}
                    autoFocus={false}
                    format="dd.MM.yyyy"
                    slotProps={{ textField: { placeholder: t('selectAdEndDate') } }}
                    disabled={false}
                    value={values?.endDate}
                    onChange={(date) => setFieldValue('endDate', date)}
                    sx={{ flexGrow: 1 }}

                  />
                </Stack>

              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card >
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t('addNewCaterory')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('categoryName')}
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label={t('categoryDescription')}
            type="text"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('Cancel')}</Button>
          <Button onClick={handleSave}>{t('Save')}</Button>
        </DialogActions>
      </Dialog>
    </>

  )
};
