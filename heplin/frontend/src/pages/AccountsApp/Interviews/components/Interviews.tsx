import { Card, CardHeader, Container } from '@mui/material'
import React from 'react'
import InterviewTable from './InterviewTable'
import { useRouter } from 'src/hooks/use-router'
import { useTranslation } from 'react-i18next'
import { useInterview } from '../InterviewContext/InterviewProvider'
import { enqueueSnackbar } from 'notistack';
const Interviews = () => {
    const { t } = useTranslation();
    const route = useRouter()
    const { candidateInterviews, updateInterview, candidateInterviewQuery } = useInterview()
    const handleInterviewDetail = (interview: any) => {
        if (interview.accessLocked) {
            return null
        }

        if (interview?.expirationDate) {
            const expirationDate = new Date(interview.expirationDate);
            const currentTime = new Date();

            if (currentTime >= expirationDate) {
                updateInterview.mutateAsync({
                    interviewId: interview?._id ?? '',
                    payload: { accessLocked: true, status: 'expired' }
                }, {
                    onSuccess: () => {
                        enqueueSnackbar('Görüşme süresi doldu.', { variant: 'success' });
                        candidateInterviewQuery.refetch();
                    },
                    onError: () => {
                        enqueueSnackbar('Bir hata oluştu.', { variant: 'error' });
                    },
                });
            }
        }

        route.push(`/interviews/${interview?._id}`)
    }

    return (
        <Container maxWidth="xl" >
            <div className="flex flex-col gap-2">
                <div>
                    <Card>
                        <CardHeader title={t('TextInterview')} />
                        <InterviewTable
                            interviewsList={candidateInterviews?.filter((item: any) => item?.interviewType === 'text')}
                            handleClick={handleInterviewDetail}
                        />
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader title={t('VideoInterview')} />
                        <InterviewTable
                            interviewsList={candidateInterviews?.filter((item: any) => item?.interviewType === 'video')}
                            handleClick={handleInterviewDetail}
                        />
                    </Card>
                </div>
            </div>


        </Container>
    )
}

export default Interviews