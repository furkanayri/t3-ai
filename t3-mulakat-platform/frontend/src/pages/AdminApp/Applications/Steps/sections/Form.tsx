import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, FormControlLabel, Paper, Radio, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DownloadCVButton } from "src/components";
import { useGetJobDetailPublicQuery } from "src/hooks/useServices";
import { useCreateJobApplicationMutation, useGetUserCvsQuery } from "src/hooks/useServices/admin";
import Questions from "src/pages/AccountsApp/Apply/Questions";
import { array } from "src/utils";

function isEmpty(val: any) {
  return (
    val === '' || val === null || val === undefined || (Array.isArray(val) && val.length === 0)
  );
}

const validateApplicantAnswers = (answers: any) => {
  return answers.map((a: any) =>
    a?.question?.options?.isRequired && isEmpty(a?.answer) ? 'The field is required' : null
  );
};

export default function Form() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [applicantAnswers, setApplicantAnswers] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [formState, setFormState] = useState({
    touched: {
      applicantAnswers: [],
    },
    errors: {
      applicantAnswers: [],
    },
    submitCount: 0,
  });

  const jobId = searchParams.get("jobId") ?? '';

  const jobDetailQuery = useGetJobDetailPublicQuery({ id: jobId });
  const jobDetail = jobDetailQuery?.data?.job

  const filesQuery = useGetUserCvsQuery(id!, {
    onSuccess: (data) => {
      if (Array.isArray(data?.results) && !selectedCV) {
        setSelectedCV(data?.results?.[0]?._id);
      }
    }
  });
  const filesData = array<any>(filesQuery.data?.results);

  const createApplicationMutation = useCreateJobApplicationMutation()

  const setAnswer = (value: any, index: number) => {
    const copyApplicantAnswers = JSON.parse(JSON.stringify(applicantAnswers));

    copyApplicantAnswers[index].answer = value;
    const copyFormState = JSON.parse(JSON.stringify(formState));

    copyFormState.errors.applicantAnswers = validateApplicantAnswers(copyApplicantAnswers);

    setFormState(copyFormState);
    setApplicantAnswers(copyApplicantAnswers);
  };

  const handleBlurApplicantForm = (index: number) => {
    const copyFormState = JSON.parse(JSON.stringify(formState));

    copyFormState.touched.applicantAnswers = Array.from(Array(applicantAnswers.length).keys()).map(
      (item, ind) => index === ind || copyFormState.touched.applicantAnswers?.[item]
    );

    copyFormState.errors.applicantAnswers = validateApplicantAnswers(applicantAnswers);

    setFormState(copyFormState);
  };

  useEffect(() => {

    if (Array.isArray(jobDetail?.applicantForm)) {
      return setApplicantAnswers(
        jobDetail?.applicantForm.map((question: any) => ({
          question,
          questionId: question?._id,
          answer: '',
        }))
      );
    }

    return setApplicantAnswers([]);
  }, [jobDetail?.applicantForm, jobId]);

  const handleApply = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
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

    createApplicationMutation.mutate({
      payload: {
        applicantAnswers: applicantAnswers.map((item: any) => ({
          questionId: item?.questionId,
          answer: item?.answer,
        })),
        cv: selectedCV,
        jobId: jobId,
        coverLetter,
        userId: id,
      }
    },
      {
        onSuccess: (res) => {
          enqueueSnackbar(t('applicationSubmittedSuccessfully'), { variant: 'success' });
          navigate('/applications');
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.response?.data?.message, {
            variant: 'error',
          });
        },
      })

  }

  const handlePrev = () => {
    setSearchParams(prev => {
      prev.set("activeStep", "2")
      return prev
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-lg font-medium">
        {t('CV Files')}
      </p>
      <div className="flex flex-wrap gap-2">
        {filesData.length > 0 ? (
          filesData.map((file) => (
            <Paper
              key={file._id}
              sx={{
                maxWidth: 'max-content',
                alignItems: 'flex-start',
                display: 'flex',
                p: 2,
                flex: '1 1 0%',
              }}
              variant="outlined"
            >
              <FormControlLabel
                control={<Radio />}
                key={file._id}
                sx={{
                  flex: '1 1 0%',
                  display: 'flex',
                }}
                checked={selectedCV === file._id}
                onChange={(e) => setSelectedCV((e.target as any)?.value)}
                componentsProps={{
                  typography: {
                    display: 'flex',
                    flex: '1 1 0%',
                  },
                }}
                label={
                  <Box
                    sx={{
                      ml: 2,
                      justifyContent: 'space-between',
                      display: 'flex',
                      alignItems: 'center',
                      flex: '1 1 0%',
                      gap: 2
                    }}
                  >
                    <Typography variant="subtitle2">{file.title}</Typography>
                    <DownloadCVButton
                      id={file._id}
                      fileName="candidate-cv.pdf"
                    />
                  </Box>
                }
                value={file._id}
              />
            </Paper>
          ))
        )
          : <Alert severity="warning">{t('noCvFileFound')}</Alert>
        }
      </div>

      <p className="font-medium text-lg">
        {t('coverLetter')}
      </p>
      <div>
        <TextField
          fullWidth
          multiline
          hiddenLabel
          minRows={5}
          name="coverLetter"
          onChange={(e) => { setCoverLetter(e.target.value) }}
          value={coverLetter}
        />
      </div>

      {applicantAnswers.length > 0 ?
        <div>
          <Questions
            errors={formState.errors.applicantAnswers}
            touched={formState.touched.applicantAnswers}
            setAnswer={setAnswer}
            questions={applicantAnswers}
            onBlur={handleBlurApplicantForm}
          />
        </div> : null
      }
      <div className="flex justify-between">
        <Button
          variant="outlined"
          onClick={handlePrev}
        >
          {t('back')}
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleApply}
          loading={createApplicationMutation.isLoading}
        >
          {t('Save')}
        </LoadingButton>
      </div>
    </div>
  )
}
