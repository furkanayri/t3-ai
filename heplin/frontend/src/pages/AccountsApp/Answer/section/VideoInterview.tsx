import React, { useEffect, useRef, useState } from 'react'
import { useInterview } from '../../Interviews/InterviewContext/InterviewProvider'
import { Button, Card, IconButton, Step, StepLabel, Stepper, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { PlayCircleIcon } from 'hugeicons-react'
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import VideoSave from '../components/VideoSave'
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'src/hooks/use-router'
import { useCandidateVideoAnswersUpdateMutation } from 'src/hooks/useServices/useInterviewServices'
import { format } from 'date-fns'
const VideoInterview = () => {
  const { interviewQuestion, interview, updateInterview, candidateAnswers, interviewQuery } = useInterview()
  const { interviewId } = useParams();
  const route = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number | null>(null);

  const { t } = useTranslation();

  // const interviewVideoSaveMutation = useCandidateVideoAnswersUpdateMutation()


  useEffect(() => {
    setActiveStep(interview?.questionIndex)
  }, [interview])

  const toggleAudio = (audioId: string) => {
    const currentAudio = audioRefs.current[audioId];
    if (currentAudio) {
      if (playingAudioId === audioId) {
        currentAudio.pause();
        setPlayingAudioId(null);
      } else {
        if (playingAudioId && audioRefs.current[playingAudioId]) {
          audioRefs.current[playingAudioId]?.pause();
        }
        currentAudio.play();
        setPlayingAudioId(audioId);
      }
    }
  };
  const handleModalConfirm = () => {

    if (activeStep === interviewQuestion?.questions?.length - 1) {
      updateInterview.mutateAsync({
        interviewId: interviewId ?? '',
        payload: {
          accessLocked: true,
          status: 'completed'
        }
      })
      route.push('/interviews')
      interviewQuery.refetch()
    }

    setActiveStep(activeStep + 1);
  };



  const q = interviewQuestion?.questions[activeStep];

  const formatTime = (milliseconds: number) => {
    const date = new Date(milliseconds)
    return format(date, 'mm:ss')
  }


  return (
    <div>

      <Stepper
        alternativeLabel
        activeStep={activeStep}
        sx={{ my: 4 }}
      >
        {interviewQuestion?.questions?.map((step: any) => {
          return (
            <Step key={step._id}>
              <StepLabel>{t('question')}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {timer !== null ? `Kalan Süre: ${formatTime(timer)}` : ""}
      <div className='flex  items-center justify-center'>
        {q?.audioKey ?
          <div>
            <audio id={`audio-${q?._id}`} ref={(el) => (audioRefs.current[q?._id] = el)} src={`https://t3burs.org/${q.audioKey}`} />
            <IconButton
              color='primary'
              onClick={() => toggleAudio(q?._id)}
            >
              {playingAudioId === q?._id ? <PauseCircleIcon /> : <PlayCircleIcon />}
            </IconButton>
          </div> :

          <Tooltip title="no audio available">
            <IconButton disabled >
              <PlayCircleIcon style={{ color: 'black' }} />
            </IconButton>
          </Tooltip>
        }
        <p>{q?.question}</p>
      </div>
      <VideoSave
        onConfirm={handleModalConfirm}
        question={q}
        activeStep={activeStep}
      />
    </div>
  )
}

export default VideoInterview