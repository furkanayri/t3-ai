import { Box, Container, Stack, Typography } from '@mui/material'
import { EventBusyOutlined } from '@mui/icons-material'
import React from 'react'
import InterviewCard from './InterviewCard'
import { useRouter } from 'src/hooks/use-router'
import { useTranslation } from 'react-i18next'
import { useInterview } from '../InterviewContext/InterviewProvider'
import { enqueueSnackbar } from 'notistack';
const Interviews = ({ onInterviewClick }: { onInterviewClick?: (interview: any) => void }) => {
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

        if (onInterviewClick) {
            onInterviewClick(interview)
            return
        }

        route.push(`/interviews/${interview?._id}`)
    }

    const interviews = candidateInterviews ?? [];

    return (
        <Container maxWidth="xl" disableGutters>
            {interviews.length === 0 ? (
                <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 6, textAlign: 'center' }}>
                    <EventBusyOutlined sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography variant="body1" color="text.secondary">
                        {t('NoInterviewFound')}
                    </Typography>
                </Stack>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    }}
                >
                    {interviews.map((interview: any) => (
                        <InterviewCard
                            key={interview?._id}
                            interview={interview}
                            onClick={handleInterviewDetail}
                        />
                    ))}
                </Box>
            )}
        </Container>
    )
}

export default Interviews