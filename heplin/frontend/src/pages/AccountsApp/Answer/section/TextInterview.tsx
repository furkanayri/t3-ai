import React, { useEffect, useState } from 'react'
import { useInterview } from '../../Interviews/InterviewContext/InterviewProvider'
import { useCandidateAnswersUpdateMutation, useCandidateInterviewUpdateMutation, useGetOneCandidateAnswerQuery } from 'src/hooks/useServices/useInterviewServices';
import { Formik, Form, Field } from 'formik';
import { Button, Card, CardContent, Container, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import usePageVisibility from '../../Interviews/hooks/usePageVisibility';
import usePasteDetected from '../../Interviews/hooks/usePasteDetected';
import Chat from '../components/Chat';
import { useParams } from 'react-router';

const TextInterview = () => {
  const { interviewQuestion, interview, logsMutation, updateInterview, interviewAnswerMutation, candidateAnswers, interviewQuery } = useInterview()
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { interviewId } = useParams()

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const [isVisible, resetVisibility] = usePageVisibility();
  const [isPasted, resetPasteDetection] = usePasteDetected();

  const answer = candidateAnswers?.data?.interiewAnswers


  useEffect(() => {
    setCurrentQuestionIndex(interview.questionIndex)
  }, [interview])

  useEffect(() => {
    if (isVisible) {
      logsMutation.mutateAsync({
        interviewId: interview._id ?? '',
        payload: {
          eventType: isVisible && 'tabChange',
          questionId: interviewQuestion?.questions[currentQuestionIndex]?._id
        }
      },)
    }
  }, [])
  useEffect(() => {
    if (isPasted) {
      logsMutation.mutateAsync({
        interviewId: interview._id ?? '',
        payload: {
          eventType: isPasted && 'copy',
          questionId: interviewQuestion?.questions[currentQuestionIndex]?._id
        }
      },
        {
          onSuccess(data: any) {
            if (typeof resetPasteDetection === 'function') resetPasteDetection()
          },
          onError(error: any) {
            console.log(error)
          }
        }
      )
    }
  }, [isPasted])


  useEffect(() => {
    const currentQuestion = interviewQuestion?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const { _id: questionId, duration, question } = currentQuestion;
    const durationMs = duration * 60 * 1000;
    const storageKey = `startTime_${questionId}`;

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('startTime_') && key !== storageKey) {
        localStorage.removeItem(key);
      }
    });

    let savedStartTime = localStorage.getItem(storageKey);
    let remainingTime;

    if (savedStartTime) {
      const startTime = parseInt(savedStartTime, 10);
      const elapsedTime = Date.now() - startTime;
      remainingTime = durationMs - elapsedTime;

      if (remainingTime <= 0) {
        localStorage.removeItem(storageKey);
        handleNextQuestion({ answer: "", question, questionId });
        return;
      }
    } else {
      localStorage.setItem(storageKey, Date.now().toString());
      remainingTime = durationMs;
    }

    setTimer(remainingTime);

    const countdownInterval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer !== null && prevTimer > 1000) {
          return prevTimer - 1000;
        } else {
          clearInterval(countdownInterval);
          localStorage.removeItem(storageKey);
          handleNextQuestion({ answer: "", question, questionId });
          return null;
        }
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [currentQuestionIndex, interviewQuestion]);


  const handleNextQuestion = (values: any) => {
    const endTime = new Date();
    const timeTaken = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0

    setCurrentQuestionIndex(currentQuestionIndex + 1);
    const isLastQuestion = currentQuestionIndex === (interviewQuestion?.questions.length - 1);
    if (isLastQuestion) {
      updateInterview.mutateAsync({
        interviewId: interviewId ?? '',
        payload: {
          accessLocked: true,
          status: 'completed'
        }
      })
      interviewQuery.refetch()
    }


    interviewAnswerMutation.mutateAsync({
      candidateAnswerId: interview?.candidateAnswersId,
      payload: {
        questionId: interviewQuestion?.questions[currentQuestionIndex]?._id,
        responseTime: timeTaken,
        answer: values.answer,
        question: interviewQuestion?.questions[currentQuestionIndex]?.question,
        questionIndex: currentQuestionIndex + 1
      }
    },
      {
        onSuccess(data: any) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setStartTime(null);
          setIsTyping(false);
          candidateAnswers.refetch()
        },
      }
    )
  };

  const handleStartTimer = () => {
    if (!isTyping) {
      setStartTime(new Date());
      setIsTyping(true);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };


  return (
    <Container maxWidth='xl' >
      <Card className='my-5'>
        <CardContent className='h-full flex flex-col' >
          {answer?.length > 0 && answer?.map((item: any, index: number) => (
            <Chat item={item} />
          ))}
          {interviewAnswerMutation.isLoading && <div className="flex justify-end mt-2">
            <div className="bg-gray-300 text-black p-3 rounded-lg max-w-xl">
              <div className="flex justify-center items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-bounce delay-200"></div>
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-bounce delay-400"></div>
              </div>
            </div>
          </div>}
          {currentQuestionIndex < interviewQuestion?.questions?.length ? (
            <Formik
              initialValues={{
                answer: "",
              }}
              onSubmit={(values, helpers) => {
                handleNextQuestion(values);
                helpers.resetForm()


              }}
            >
              {({ isSubmitting, values, handleChange }) => (
                <Form>
                  <div className='mt-auto'>
                    <div className="flex justify-start mt-2">
                      <div style={{ backgroundColor: '#E31E24' }} className="text-white p-3 rounded-lg max-w-xl">
                        {interviewQuestion?.questions[currentQuestionIndex]?.question}
                      </div>
                    </div>
                    <div className='my-4 flex flex-col gap-2'>

                      <div className='w-[200px]  '>
                        {timer !== null ? `Kalan Süre: ${formatTime(timer)}` : ""}
                      </div>
                      <div className=''>
                        <TextField
                          name='answer'
                          label='Cevap'
                          fullWidth
                          multiline
                          value={values.answer}
                          onChange={(e) => {
                            handleChange(e)
                            handleStartTimer()
                          }}
                        />

                      </div>
                      <div className='text-right'>
                        <Button type="submit" size='large' variant='outlined' disabled={interviewAnswerMutation.isLoading}>
                          {interviewAnswerMutation.isLoading ? "Yükleniyor..." : "Cevapla"}
                        </Button>
                      </div>
                    </div>

                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className='text-right'>
              <h2> {t('interviewCompleted')}</h2>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>

  )
}

export default TextInterview