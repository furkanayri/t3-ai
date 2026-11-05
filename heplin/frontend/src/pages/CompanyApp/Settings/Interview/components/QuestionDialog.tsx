import React, { useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, Button, TextField, DialogActions, Tooltip, DialogTitle, Divider, IconButton, CircularProgress, Card, CardHeader, CardContent, Box } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Delete01Icon, PlayCircleIcon } from 'hugeicons-react';
import { useCreateInterviewQuestionWithJobMutation, useCreateInterviewQuestionWithTextMutation, useGetAiInterviewQuestionsQuery, useInterviewQuestionToVoiceMutation, useUpdateInterviewQuestionMutation } from 'src/hooks/useServices/useInterviewServices';
import { useSnackbar } from 'notistack';
import { ConfirmAction } from 'src/components/shared';
import { InterviewQuestionWithAi } from './InterviewQuestionWithAi';
import { InterviewQuestionWithjob } from './InterviewQuestionWithjob';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { DragIndicator } from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';


interface Question {
    question: string;
    duration: string;
    evaluationCriteria?: string;
}

interface QuestionDialogProps {
    open: boolean;
    handleClose: () => void;
    refetch: () => void;
    data: any;
}

export const QuestionDialog: React.FC<QuestionDialogProps> = ({ open, handleClose, refetch, data }) => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [saveQuestion, setSaveQuestion] = useState(false)
    const interviewQuestionsQuery = useGetAiInterviewQuestionsQuery({ interviewId: data?._id });

    const interviewQuestions = interviewQuestionsQuery?.data?.questions ? interviewQuestionsQuery?.data?.questions : [{ question: '', duration: '5' }];
    const interviewQuestionsMutation = useUpdateInterviewQuestionMutation()

    const interviewQuestionMutationWithjob = useCreateInterviewQuestionWithJobMutation()
    const interviewQuestionMutationWithText = useCreateInterviewQuestionWithTextMutation()
    const interviewQuestionToVoice = useInterviewQuestionToVoiceMutation()

    const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

    const [audioLoading, setAudioLoading] = useState('')
    const formik = useFormik({
        initialValues: {
            questions: interviewQuestions
        },
        enableReinitialize: true,
        onSubmit: (values, helpers) => {
            console.log(values);

            updateQuestion(values.questions)

        },
    });

    const updateQuestion = (values: any) => {

        interviewQuestionsMutation.mutateAsync({
            id: data._id,
            payload: { questions: values }
        }, {
            onSuccess(data, variables, context) {
                enqueueSnackbar(t('questionUpdate'), { variant: 'success' });
                interviewQuestionsQuery.refetch()
                setSaveQuestion(false)
                // helpers.resetForm({ values: { questions: interviewQuestions } }); // reset to initial form state
            },
            onError() {
                enqueueSnackbar(t('updateFailed'), { variant: 'error' });
            },
        });
    }

    const addQuestion = () => {
        const newQuestions = [...formik.values.questions, { question: '', duration: '5' }];
        formik.setFieldValue('questions', newQuestions);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = formik.values.questions.filter((_: any, idx: any) => idx !== index);
        formik.setFieldValue('questions', newQuestions);
    };

    const handleChange = (index: number, fieldName: keyof Question, value: string) => {
        const newQuestions = [...formik.values.questions];
        newQuestions[index][fieldName] = value;
        formik.setFieldValue('questions', newQuestions);
    };
    const createJobQuestionWithAi = (prompt: string, numberOfQuestions: string, lang: string) => {

        interviewQuestionMutationWithText.mutateAsync({
            payload: {
                prompt,
                numberOfQuestions,
                lang
            }
        },
            {
                onSuccess(data, variables, context) {
                    if (data.questions && data.questions.length > 0) {
                        const currentQuestions = formik.values.questions;
                        const updatedQuestions = [...currentQuestions, ...data.questions];
                        formik.setFieldValue('questions', updatedQuestions);
                        setSaveQuestion(true)
                    }
                },

            })
    }

    const createJobQuestionWithjob = (id: string, numberOfQuestions: string, lang: string) => {
        console.log(numberOfQuestions);

        interviewQuestionMutationWithjob.mutateAsync({
            jobId: id,
            numberOfQuestions: numberOfQuestions,
            lang
        }, {
            onSuccess(data, variables, context) {
                if (data.questions && data.questions.length > 0) {
                    const currentQuestions = formik.values.questions;

                    const updatedQuestions = [...currentQuestions, ...data.questions];

                    formik.setFieldValue('questions', updatedQuestions);
                    setSaveQuestion(true)
                }
            },
            onError(error, variables, context) {
                console.log(error);

            },
        })
    }

    const handleQuestionToVoice = async (questionId: string) => {
        setAudioLoading(questionId)
        await interviewQuestionToVoice.mutateAsync({
            interviewId: data._id, questionId,
        },
            {
                onSuccess(data) {
                    setAudioLoading('')
                    interviewQuestionsQuery.refetch()
                },

            }
        )
    }

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
    const onDragEnd = (result: DropResult): void => {
        if (!result.destination || result.destination.index === result.source.index) {
            return;
        }

        const updatedQuestions = Array.from(formik.values.questions);
        const [reorderedItem] = updatedQuestions.splice(result.source.index, 1);
        updatedQuestions.splice(result.destination.index, 0, reorderedItem);

        formik.setFieldValue('questions', updatedQuestions);

        updateQuestion(updatedQuestions)
        console.log("New Order:", updatedQuestions);
    };



    return (
        <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
            <DialogTitle sx={{
                textAlign: 'center',
                backgroundColor: '#e3f2fd',
                color: "#E31E24"

            }}>{data?.name} - {t('InterviewQuestions')}</DialogTitle>
            <DialogContent>
                <Card variant="outlined" sx={{ borderColor: 'primary.main', borderRadius: 1, marginTop: 2 }}>
                    <Box display="flex" alignItems="center">
                        <CardHeader
                            title={t('createInterviewQuestion')}
                            sx={{
                                p: 0, // iç boşlukları sıfırlıyoruz
                                m: 0,
                                paddingBottom: "2px",
                                paddingTop: 1,
                                paddingLeft: 3,

                                color: "#E31E24"
                            }}
                        />
                        <Tooltip
                            arrow
                            title={
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    <li>{t("createQuestionWithAI")}</li>
                                    <li>{t("createSelectJobWithAi")}</li>
                                </ul>
                            }
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        maxWidth: '800px',
                                    },
                                },
                            }}
                        >
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" sx={{ marginTop: "5px", color: "#E31E24" }} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <CardContent sx={{ paddingTop: 1 }}>
                        <div className='flex gap-2 w-full flex-col'>
                            <InterviewQuestionWithAi
                                onClick={(prompt, numberOfQuestions, lang) => createJobQuestionWithAi(prompt, numberOfQuestions, lang)}
                                loading={interviewQuestionMutationWithText.isLoading}
                            />
                            <InterviewQuestionWithjob
                                loading={interviewQuestionMutationWithjob.isLoading}
                                onClick={(id, numberOfQuestions, lang) => createJobQuestionWithjob(id, numberOfQuestions, lang)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderColor: 'primary.main', borderRadius: 1, marginTop: 2 }}>
                    <Box display="flex" alignItems="center">
                        <CardHeader
                            title={t('InterviewQuestions')}
                            sx={{
                                p: 0, // iç boşlukları sıfırlıyoruz
                                m: 0,
                                paddingBottom: "2px",
                                paddingTop: 1,
                                paddingLeft: 3,

                                color: "#E31E24"
                            }}
                        />
                        <Tooltip
                            arrow
                            title={
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    <li>{t("editIntreviewQuestion")}</li>
                                    <li>{t("editInterviewQuestion2")}</li>
                                </ul>
                            }
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        maxWidth: '800px',
                                    },
                                },
                            }}
                        >
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" sx={{ marginTop: "5px", color: "#E31E24" }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <CardContent>
                        <form onSubmit={formik.handleSubmit}>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="drop">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                            {formik.values.questions.map((question: any, index: any) => (
                                                <Draggable key={question._id} draggableId={question._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="flex gap-2 mb-4 items-center p-2 border border-gray-200 rounded-lg"
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                backgroundColor: snapshot.isDragging ? '#fadf87' : '#fff',
                                                                boxShadow: snapshot.isDragging ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
                                                            }}
                                                        >
                                                            <div className="w-[40px]">
                                                                {question?.audioKey ? (
                                                                    <div>
                                                                        <audio
                                                                            id={`audio-${question?._id}`}
                                                                            ref={(el) => (audioRefs.current[question?._id] = el)}
                                                                            src={`https://t3burs.org/${question.audioKey}`}
                                                                        />
                                                                        <IconButton color="primary" onClick={() => toggleAudio(question?._id)}>
                                                                            {playingAudioId === question?._id ? <PauseCircleIcon /> : <PlayCircleIcon />}
                                                                        </IconButton>
                                                                    </div>
                                                                ) : (
                                                                    <ConfirmAction
                                                                        title={t('addVoice')}
                                                                        description={t('addVoiceDesc')}
                                                                        onConfirm={async () => {
                                                                            await handleQuestionToVoice(question?._id);
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            {interviewQuestionToVoice.isLoading && audioLoading === question?._id ? (
                                                                                <CircularProgress size={24} />
                                                                            ) : (
                                                                                <Tooltip className="cursor-pointer" title={t('addVoice')}>
                                                                                    <IconButton type="button" color="warning">
                                                                                        <PlayCircleIcon size={24} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            )}
                                                                        </div>
                                                                    </ConfirmAction>
                                                                )}
                                                            </div>
                                                            <TextField
                                                                fullWidth
                                                                sx={{ width: 800 }}
                                                                label={t('question')}
                                                                name="question"
                                                                value={question.question}
                                                                onChange={(e) => handleChange(index, 'question', e.target.value)}
                                                                size="small"
                                                                required
                                                                inputProps={{ min: 3, max: 10 }}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                sx={{ width: 800, mt: 1 }}
                                                                label={`${t('evaluationCriteria')} (${t('optional')})`}
                                                                name="evaluationCriteria"
                                                                value={question.evaluationCriteria || ''}
                                                                onChange={(e) => handleChange(index, 'evaluationCriteria', e.target.value)}
                                                                size="small"
                                                                multiline
                                                                rows={2}
                                                                placeholder={t('evaluationCriteriaPlaceholder')}
                                                                helperText={t('evaluationCriteriaHelper')}
                                                            />
                                                            <TextField
                                                                label={t('duration (min)')}
                                                                name="duration"
                                                                type="number"
                                                                sx={{ width: 150 }}
                                                                value={question.duration}
                                                                onChange={(e) => handleChange(index, 'duration', e.target.value)}
                                                                size="small"
                                                                inputProps={{ min: 1, max: 10 }}
                                                                required
                                                            />
                                                            <div className="flex items-center justify-center flex-grow">
                                                                <ConfirmAction title={t('deleteQuestion')} description={t('Confirm Delete')} onConfirm={async () => removeQuestion(index)}>
                                                                    <Tooltip className="cursor-pointer" title={t('delete')}>
                                                                        <Delete01Icon size={18} color="#FD5F5F" />
                                                                    </Tooltip>
                                                                </ConfirmAction>
                                                            </div>
                                                            <div>
                                                                <DragIndicator color="disabled" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                            {saveQuestion && <p className="text-red-400">{t('PleaseDontForget')}</p>}

                            <DialogActions>
                                <Button type="button" onClick={addQuestion} variant="contained">
                                    {t('addQuestion')}
                                </Button>
                                <Button type="submit" variant="contained">

                                    {t('save')}
                                </Button>
                            </DialogActions>
                        </form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog >
    );
};
