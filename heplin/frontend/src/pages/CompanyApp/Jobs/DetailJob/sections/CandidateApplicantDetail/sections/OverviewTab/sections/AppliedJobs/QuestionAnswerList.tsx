import { Chip, List, ListItem, Typography } from '@mui/material';
import React from 'react'
import { ApplicantForm } from '../../../../CandidateApplicantDetail';
import { Close, Done } from '@mui/icons-material';

const QuestionAnswerList = ({ questions, answers }: { questions: any, answers: any }) => {
    return (
        <List>
            {questions?.map((question: any, ind: number) => {
                const candidateAnswer = answers?.find((answer: any) => answer?.questionId === question?._id)

                const isMatching = candidateAnswer?.isMatching
                return (
                    <ListItem
                        key={question._id}
                        disableGutters
                        divider
                        sx={{
                            alignItems: 'flex-start',
                            flexDirection: 'column',
                            padding: 2,
                        }}
                    >
                        <Typography variant="subtitle2">{`${(ind + 1)}. ${question.title}`}</Typography>
                        <Typography
                            color="text.secondary"
                            variant="body2"
                            component="div"
                            className='flex items-center gap-x-2'
                        >
                            <div className='w-5 h-5'>
                                {
                                    typeof isMatching === "boolean" ?
                                        isMatching ? <Done fontSize='small' color='success' /> : <Close color='error' fontSize='small' />
                                        : null
                                }
                            </div>
                            <CandidateAnswer
                                question={question}
                                answer={candidateAnswer?.answer}
                            />
                        </Typography>
                    </ListItem>
                );
            })}
        </List>
    )
}

export default QuestionAnswerList

function CandidateAnswer({ answer, question }: { answer: any; question: ApplicantForm }) {
    if (typeof answer === 'string') {
        if (question.type === 'choice') {
            return (
                <Chip
                    label={answer}
                    size="small"
                    sx={{ mt: 1, background: '#eee', fontSize: 12 }}
                />
            );
        }
        return (
            <Typography
                component="div"
                whiteSpace="pre-line"
                variant="body2"
                color="text.secondary"
            >
                {answer ?? <Chip label="Empty" />}
            </Typography>
        );
    }

    if (typeof answer === 'number') {
        return `${question.options?.currency ?? ''} ${answer}`;
    }

    if (typeof answer === 'boolean') {
        return answer ? 'Yes' : 'No';
    }

    if (Array.isArray(answer)) {
        return (
            <div className="flex flex-wrap gap-2">
                {answer.map((a, ind) => (
                    <Chip
                        key={a + ind}
                        label={a?.toString?.()}
                        size="small"
                        sx={{ mt: 1, background: '#eee', fontSize: 12 }}
                    />
                ))}
            </div>
        );
    }

    return null;
}