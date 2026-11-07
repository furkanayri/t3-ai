import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
  alpha,
  useMediaQuery,
} from '@mui/material';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApplyJobApplicationMutation, useGetJobDetailPublicQuery, useJobIncreaseViewMutation } from 'src/hooks/useServices';
import JobDetail from './JobDetail';
import Profile from './Profile';
import Questions from './Questions';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { array } from 'src/utils';
import object from 'src/utils/object';
import { useTranslation } from 'react-i18next';
import store from 'store'

const steps = [
  {
    key: 'jobOverview',
    label: 'Job Overview',
  },
  {
    key: 'profile',
    label: 'Profile',
  },
  {
    key: 'questions',
    label: 'Questions',
  },
];

function isEmpty(val: any) {
  return (
    val === '' || val === null || val === undefined || (Array.isArray(val) && val.length === 0)
  );
}

export function Component() {
  const { jobId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCV, setSelectedCV] = useState<null | string>(null);
  const [applicantAnswers, setApplicantAnswers] = useState([]);
  const [coverLetter, setCoverLetter] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  store.set('latestApplyJob', { jobId: jobId });

  const [formState, setFormState] = useState({
    touched: {
      applicantAnswers: [],
    },
    errors: {
      applicantAnswers: [],
    },
    submitCount: 0,
  });

  const applyJobMutation = useApplyJobApplicationMutation();

  useEffect(() => {
    window?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [activeStep]);

  const activeStepKey = steps[activeStep].key;

  const activeJobId = jobId ?? '';
  const jobDetailQuery = useGetJobDetailPublicQuery({ id: activeJobId });
  const increaseView = useJobIncreaseViewMutation({ id: activeJobId });
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const prevJobApplied = useMemo<any>(() => {
    return object<any>(store.get(`appliedJobs:${activeJobId}`));
  }, [activeJobId]);

  const jobDetail = jobDetailQuery?.data?.job

  const setStoreAppliedJob = (key: string, value: any) => {
    store.set(`appliedJobs:${activeJobId}`, {
      ...prevJobApplied,
      [key]: value,
    });
  };

  const setAnswer = (value: any, index: number) => {
    const copyApplicantAnswers = JSON.parse(JSON.stringify(applicantAnswers));

    copyApplicantAnswers[index].answer = value;
    const copyFormState = JSON.parse(JSON.stringify(formState));

    copyFormState.errors.applicantAnswers = validateApplicantAnswers(copyApplicantAnswers);

    setFormState(copyFormState);
    setApplicantAnswers(copyApplicantAnswers);
    setStoreAppliedJob(
      'answers',
      array<any>(copyApplicantAnswers)
        .map((item) => ({
          answer: item?.answer,
          questionId: item?.questionId,
        }))
        .reduce((prev, curr) => {
          return { ...prev, [curr?.questionId]: curr?.answer };
        }, {})
    );
  };

  const validateApplicantAnswers = (answers: any) => {
    return answers.map((a: any) =>
      a?.question?.options?.isRequired && isEmpty(a?.answer) ? 'The field is required' : null
    );
  };

  const handleBlurApplicantForm = (index: number) => {
    const copyFormState = JSON.parse(JSON.stringify(formState));

    copyFormState.touched.applicantAnswers = Array.from(Array(applicantAnswers.length).keys()).map(
      (item, ind) => index === ind || copyFormState.touched.applicantAnswers?.[item]
    );

    copyFormState.errors.applicantAnswers = validateApplicantAnswers(applicantAnswers);

    setFormState(copyFormState);
  };

  const onApply: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!selectedCV) return enqueueSnackbar(t('pleaseSelectACvFile'));
    const copyFormState = JSON.parse(JSON.stringify(formState));
    copyFormState.errors.applicantAnswers = validateApplicantAnswers(applicantAnswers);
    copyFormState.touched.applicantAnswers = applicantAnswers.map((a) => true);
    copyFormState.submitCount = copyFormState.submitCount + 1;
    setFormState(copyFormState);

    if (copyFormState.errors?.applicantAnswers?.some((err: any) => !!err))
      return enqueueSnackbar(t('missingFieldsInApplicationForm'), {
        variant: 'error',
      });

    applyJobMutation.mutate(
      {
        applicantAnswers: applicantAnswers.map((item: any) => ({
          questionId: item?.questionId,
          answer: item?.answer,
        })),
        cv: selectedCV,
        jobId: activeJobId,
        coverLetter,
      },
      {
        onSuccess: (res) => {
          enqueueSnackbar(t('applicationSubmittedSuccessfully'), { variant: 'success' });
          navigate('/my-applications');
        },
        onError: (err: any) => {
          enqueueSnackbar(t(err?.response?.data?.message), {
            variant: 'error',
          });
        },
      }
    );
  };

  useEffect(() => {
    prevJobApplied?.cv && setSelectedCV(prevJobApplied?.cv?.toString());
    prevJobApplied?.coverLetter && setCoverLetter(prevJobApplied?.coverLetter?.toString());

    if (Array.isArray(jobDetail?.applicantForm)) {
      return setApplicantAnswers(
        jobDetail?.applicantForm.map((question: any) => ({
          question,
          questionId: question?._id,
          answer: prevJobApplied?.answers?.[question?._id] ?? '',
        }))
      );
    }

    return setApplicantAnswers([]);
  }, [jobDetail?.applicantForm, activeJobId, prevJobApplied]);

  if (jobDetailQuery.isLoading) return <CircularProgress />;

  if (jobDetailQuery.isError)
    return <Alert severity="error">{(jobDetailQuery.error as any)?.response?.data?.message}</Alert>;

  if (!jobDetail) return <Alert severity="warning">{t('jobNotFound')}</Alert>;

  return (
    <Box
      sx={{ mx: 'auto', maxWidth: 1280, px: { xs: 2, sm: 3, md: 4 }, width: 1 }}
      component={'form'}
      onSubmit={onApply}
    >
      <Box
        sx={{
          backdropFilter: 'blur(6px)',
          position: isMobile ? 'relative' : 'sticky',
          top: 1,
          pb: 1,
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Typography variant="h4" className="text-blue-900 font-bold mb-2">
          {jobDetail?.title}
        </Typography>
        <Typography
          variant="subtitle2"
          color={'text.secondary'}
          className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg"
          sx={{ mt: 1, mb: 2 }}
        >

          {[
            jobDetail?.country?.names[i18n?.language],
            jobDetail?.city,
            jobDetail?.district,
            t(jobDetail?.jobType),
            t(jobDetail?.locationType),
            new Date(jobDetail?.createdAt).toLocaleDateString(),
          ]
            .filter((field) => !!field)
            .join(' · ')}
        </Typography>

        <Stepper
          alternativeLabel
          activeStep={activeStep}
          sx={{ my: 4 }}
        >
          {steps.map((step) => {
            return (
              <Step key={step.key}>
                <StepLabel>{t(step.label)}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
      {activeStepKey === 'jobOverview' && <JobDetail job={jobDetail} />}
      {activeStepKey === 'profile' && (
        <Profile
          coverLetter={coverLetter}
          onChangeCoverLetter={(val) => {
            setStoreAppliedJob('coverLetter', val);
            setCoverLetter(val);
          }}
          selectedCV={selectedCV}
          onSelectCV={(cv: string) => {
            setStoreAppliedJob('cv', cv);
            setSelectedCV(cv);
          }}
        />
      )}
      {activeStepKey === 'questions' && (
        <Questions
          errors={formState.errors.applicantAnswers}
          touched={formState.touched.applicantAnswers}
          setAnswer={setAnswer}
          questions={applicantAnswers}
          onBlur={handleBlurApplicantForm}
        />
      )}

      <Box
        sx={{ my: 4 }}
        className="flex items-center justify-end gap-x-2"
      >
        {activeStep > 0 && (
          <Button
            sx={{ color: 'text.secondary' }}
            onClick={() => setActiveStep((prev) => prev - 1)}
          >
            {t('back')}
          </Button>
        )}
        {steps.length - 1 > activeStep && (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
          >
            {t('next')}
          </Button>
        )}

        {steps.length - 1 === activeStep && (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={applyJobMutation.isLoading}
          >
            {t('applyJob')}
          </LoadingButton>
        )}
      </Box>
    </Box>
  );
}

Component.displayName = 'ApplyJob';
