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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGetAllCategoriesQuery, usePostNewCategoriesMutation } from 'src/hooks/useServices';
import { useGetAllEmployeesOfTenant, useGetAllRecruitmentStagesOfTenantQuery } from '../../../../../hooks/useServices/admin';
import type { JobForm } from 'src/types/jobPost';
import { array } from 'src/utils';
import { DatePicker } from '@mui/x-date-pickers';
import { Employee, RecruitmentStage } from 'src/types';
import AddIcon from '@mui/icons-material/Add';
import CreateDepartment from 'src/pages/CompanyApp/Teams/sections/Departments/CreateDepartment';
import { useDialog } from 'src/hooks/use-dialog';
import CreateTeam from 'src/pages/CompanyApp/Teams/sections/Teams/CreateTeam';
import { Categories } from 'src/types/Categories';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from 'src/providers';

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
  const { values, handleBlur, handleChange, errors, touched, setFieldValue } = useFormikContext<JobForm>();

  const dialogDepartment = useDialog<any>();
  const dialogTeam = useDialog<any>();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { activeTenantId } = useAuth();

  const categoriesQuery = useGetAllCategoriesQuery('');
  const categories = array<Categories>(categoriesQuery?.data?.results);

  const recruitmentStagesQuery = useGetAllRecruitmentStagesOfTenantQuery({ tenantId: values?.tenantId! });
  const recruitmentStages = array<RecruitmentStage>(recruitmentStagesQuery?.data?.results)
    .filter((stage: any) => stage.stepsSort && stage.stepsSort.length);

  const employeesQuery = useGetAllEmployeesOfTenant({ tenantId: values?.tenantId! })
  const employees = array<Employee>(employeesQuery.data?.results)
  const postCategory = usePostNewCategoriesMutation();

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
        payload: { name, description, tenantId: activeTenantId ?? '', status: 'active' },
        adminTenantId: activeTenantId ?? '',
      },
      {
        onSuccess: () => {
          categoriesQuery.refetch();
          enqueueSnackbar('Category added successfully', { variant: 'success' });
          handleClose();
        },
        onError: (error: unknown) => {
          const errorMessage = (error as { message: string }).message;
          return enqueueSnackbar(errorMessage, { variant: 'error' });
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
                <Stack>
                  <TextField
                    required
                    label={t('jobTitle')}
                    name="title"
                    value={values.title ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && !!errors.title}
                    helperText={touched.title && errors.title}
                    sx={{ flexGrow: 1 }}
                  />
                </Stack>

                <div className='flex items-center justify-center'>


                  <Stack sx={{ width: '100%', maxHeight: 57 }} >
                    <TextField
                      fullWidth
                      label={t('categories')}
                      name="categoryId"
                      value={values.categoryId ?? null}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.categoryId && !!errors.categoryId}
                      select
                      required
                    >
                      {categories.filter((category: any) => category.status === "active").map((category: any) => (
                        <MenuItem
                          key={category?._id}
                          value={category?._id}
                        >
                          {category?.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Typography textAlign={'end'} variant="caption" color="red">{touched.categoryId && errors.categoryId}</Typography>
                  </Stack>
                  <IconButton onClick={handleOpen}>
                    <AddIcon />
                  </IconButton>
                </div>

                <Stack>
                  <Autocomplete
                    fullWidth
                    disablePortal
                    options={employees ?? []}
                    value={values.hiringTeams ?? []}
                    onChange={(event: any, value: any) => {
                      setFieldValue('hiringTeams', value)
                    }}
                    isOptionEqualToValue={(opt, val) => opt._id === val._id}
                    getOptionLabel={(opt) => `${opt?.name} ${opt?.surname}`}
                    renderInput={(params: any) => <TextField {...params} label={t('recruitmentPersonnel')} />}
                    multiple
                    disabled={!values?.tenantId}
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
                    disabled={!values?.tenantId}
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
                    label={t('jobAdEndDate')}
                    autoFocus={false}
                    format="dd.MM.yyyy"
                    slotProps={{ textField: { placeholder: t('selectAdEndDate') } }}
                    disabled={false}
                    value={values?.endDate ? new Date(values?.endDate) : null}
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
            multiline
            minRows={3}
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
