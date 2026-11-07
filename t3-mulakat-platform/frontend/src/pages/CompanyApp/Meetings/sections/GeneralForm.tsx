import {
  Autocomplete,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepChip } from 'src/components/shared';
import { useGetAllJobApplicationsQuery, useGetAllJobsQuery, useGetAllEmployeesQuery } from 'src/hooks/useServices';
import { useAuth } from 'src/providers';
import { Meeting } from 'src/types';
import { array } from 'src/utils';

const meetingTypes = [
  {
    label: 'onsite',
    value: 'onsite',
  },
  {
    label: 'online',
    value: 'online',
  },
  {
    label: 'phone',
    value: 'phone',
  },
];
export default function GeneralForm() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const { values, handleBlur, handleChange, setFieldValue, errors, touched } =
    useFormikContext<Meeting>();

  const jobsQuery = useGetAllJobsQuery();
  const jobsData = array(jobsQuery?.data?.results);
  const [selectedJob, setSelectedJob] = useState<any>(undefined);
  const jobApplicationsQuery = useGetAllJobApplicationsQuery({ jobId: selectedJob?._id ?? '', page: 0, limit: 50 });
  const jobApplicationsData = array(jobApplicationsQuery?.data?.results);

  const employeesQuery = useGetAllEmployeesQuery('')
  const employees = array<any>(employeesQuery.data?.results)
  useEffect(() => {
    if (values.jobId) {
      setSelectedJob({ name: "", _id: values.jobId })
    }
  }, [values])
  return (
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
            <Typography variant="h6">{t('meetingInfo')}</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('selectjobCandidateAndDetails')}
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
                  fullWidth
                  label={t("Job")}
                  name="jobId"
                  value={values.jobId ?? ''}
                  onChange={(e) => {
                    setFieldValue('jobId', e.target.value);
                    setFieldValue('candidateId', null);
                  }}
                  onBlur={handleBlur}
                  error={touched.jobId && !!errors.jobId}
                  helperText={touched.jobId && errors.jobId}
                  select
                  required
                >
                  {jobsData.map((job: any) => (
                    <MenuItem
                      key={job?._id}
                      value={job?._id}
                      onClick={() => {
                        setSelectedJob(job);
                      }}
                    >
                      {job?.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack>
                <TextField
                  fullWidth
                  label={t("host_meeting")}
                  name="hostId"
                  value={values.hostId ?? ''}
                  onChange={(e) => {
                    setFieldValue('hostId', e.target.value);
                  }}
                  onBlur={handleBlur}
                  error={touched.hostId && !!errors.hostId}
                  helperText={touched.hostId && errors.hostId}
                  select
                  required
                >
                  {employees.map((employee: any) => (
                    <MenuItem
                      key={employee?._id}
                      value={employee?._id}

                    >
                      {employee?.name}  {employee?.surname}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Autocomplete
                disablePortal
                multiple
                options={employees}
                value={values.attendees?.employeeId}
                onChange={(event, value) => {
                  const updatedAttendees = value.map(option => ({
                    employeeId: option._id,
                    attendeeUrl: option.attendeeUrl
                  }));
                  setFieldValue('attendees', updatedAttendees);
                }}
                renderInput={(params) => (
                  <TextField {...params} label={t('Meeting Attendees')} />
                )}
                getOptionLabel={(option) => `${option.name} ${option.surname}`}
              />

              <Stack>
                <TextField
                  fullWidth
                  label={t("candidate")}
                  name="candidateId"
                  value={values.candidateId ?? null}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setCurrentStep(null);
                      setFieldValue('candidateId', null);
                      setFieldValue('recruitmentStageStepId', null);
                    }

                    const jobApplication: any = jobApplicationsData.find(
                      (application: any) => application?.candidateId?._id === e.target.value
                    );
                    if (!jobApplication) return;

                    setFieldValue('candidateId', e.target.value);
                    setFieldValue(
                      'recruitmentStageStepId',
                      jobApplication?.currentRecruitmentStepId?._id
                    );
                    setCurrentStep(jobApplication?.currentRecruitmentStepId?.title);
                  }}
                  onBlur={handleBlur}
                  error={touched.candidateId && !!errors.candidateId}
                  helperText={touched.candidateId && errors.candidateId}
                  disabled={!selectedJob}
                  SelectProps={{
                    multiple: false,
                    endAdornment: !!currentStep && (
                      <InputAdornment position="end">
                        <Chip
                          size="small"
                          className="!bg-slate-100 mr-6"
                          label={currentStep}
                        />
                      </InputAdornment>
                    ),
                  }}
                  select
                  required
                >
                  {jobApplicationsData?.map((application: any) => (
                    <MenuItem
                      key={application?.candidateId?._id}
                      value={application?.candidateId?._id}
                    >
                      {
                        application?.candidateId?.name +
                        ' ' +
                        application?.candidateId?.surname
                      }
                      {application?.status === 'onBoarding' ? ` (${t("Onboarding")})` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack>
                <TextField
                  fullWidth
                  label={t("meetingType")}
                  name="type"
                  value={values.type ?? null}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.type && !!errors.type}
                  helperText={touched.type && errors.type}
                  select
                  required
                >
                  {meetingTypes.map((meetingType) => (
                    <MenuItem
                      key={meetingType.value}
                      value={meetingType.value}
                    >
                      {t(meetingType.label)}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              {values.type == "online" ?
                (<Stack>
                  <TextField

                    label={t('Title')}
                    name="title"
                    required
                    value={values.title ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && !!errors.title}
                    helperText={touched.title && errors.title}
                    sx={{ flexGrow: 1 }}
                  />
                </Stack>) : null
              }

              <Stack
                direction="row"
                spacing={2}
              >



                <DatePicker
                  disablePast
                  label={t('meetingDate')}
                  autoFocus={false}
                  format="dd.MM.yyyy"
                  slotProps={{ textField: { placeholder: t('Select Meeting date') } }}
                  disabled={false}
                  value={values.date}
                  onChange={(date) => setFieldValue('date', date)}
                  sx={{ flexGrow: 1 }}

                />
                <TimePicker
                  label="Toplantı Saati"
                  autoFocus={false}
                  ampm={false}
                  slotProps={{ textField: { placeholder: t('Select Meeting Time') } }}
                  value={values.date}
                  onChange={(value) => setFieldValue('date', value)}
                  sx={{ flexGrow: 1 }}
                /*shouldDisableTime={(value: Date) => {
                  // FIXME: milisecond check logic can be improved?
                  const timeNow = new Date(new Date().setMilliseconds(0))
                  return timeNow > value
                }}*/

                />
              </Stack>
              {/* <Stack>
                <Autocomplete
                  disablePortal
                  multiple
                  options={array(selectedJob?.hiringTeams)}
                  value={values.hosts}
                  onChange={(event, value) => {
                    setFieldValue('hosts', value);
                  }}
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        label={t('Meeting Hosts')}
                      />
                    );
                  }}
                  getOptionLabel={(option: any) => {
                    return option?.name + ' ' + option?.surname;
                  }}
                  disabled={!selectedJob}
                />
              </Stack> */}
              <Stack>
                <TextField
                  multiline
                  rows={3}
                  label={t('privateNotes_visibleToMembers')}
                  name="privateNotes"
                  value={values.privateNotes ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.privateNotes && !!errors.privateNotes}
                  helperText={touched.privateNotes && errors.privateNotes}
                  sx={{ flexGrow: 1 }}
                />
              </Stack>
              <Stack>
                <TextField
                  multiline
                  rows={3}
                  label={t('notesVisibleToApplicant')}
                  name="notes"
                  value={values.notes ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.notes && !!errors.notes}
                  helperText={touched.notes && errors.notes}
                  sx={{ flexGrow: 1 }}
                />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
