import { Box, Button, Card, Chip, CircularProgress, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCreateInterviewInvitation } from "src/hooks/useServices";
import { enqueueSnackbar } from "notistack";
import { useCreateVideoInterviewInvitation } from "src/hooks/useServices/useAiVideoInterviewServices";
import DescriptionIcon from "@mui/icons-material/Description";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useCandidateInterviewInvitationMutation } from "src/hooks/useServices/useInterviewServices";
import { useParams } from "react-router";
import { useState } from "react";
const InterviewSend = ({ selectedInterview, applicantId }: { selectedInterview: any, applicantId: string }) => {
    const { t } = useTranslation()
    const { id } = useParams()
    const [typeLoading, setTypeLoading] = useState('')

    const interviewInvitation = useCandidateInterviewInvitationMutation()
    const handleInterviewInvitation = (type: string) => {
        setTypeLoading(type)
        interviewInvitation.mutateAsync({
            jobId: id || '',
            applicationId: applicantId,
            payload: {
                type,
                interviewId: selectedInterview?._id

            }
        }, {
            onSuccess(data, variables, context) {
                enqueueSnackbar(t('interviewInvite'), { variant: 'success' })
                setTypeLoading('')
            },
            onError(err: any) {
                enqueueSnackbar(t('interviewInviteFailed'), { variant: 'error' })
                enqueueSnackbar((err.response.data as any).message, { variant: 'error' })
                setTypeLoading('')


            },
        })
    }
    return (
        <>
            <Grid item xs={12}>
                <Card variant="outlined" sx={{ display: "flex", p: 2 }}>
                    <DescriptionIcon
                        color="primary"
                        sx={{ fontSize: 40, mr: 2 }}
                    />
                    <Box flexGrow={1}>
                        <Typography variant="h6">
                            {t("TextInterview")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("writingInterviewDescription")}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleInterviewInvitation('text')}
                        disabled={!selectedInterview && interviewInvitation.isLoading}
                        startIcon={
                            interviewInvitation.isLoading && typeLoading === 'text' && (
                                <CircularProgress size={20} color="inherit" />
                            )
                        }
                        sx={{
                            height: '100%', marginTop: "2px",
                            backgroundColor: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.main',
                            },
                            marginLeft: "50px"
                        }}

                    >
                        {interviewInvitation.isLoading && typeLoading === 'text'
                            ? t("Sending")
                            : t("send")}
                    </Button>
                </Card>
            </Grid>



            {
                <Grid item xs={12}>
                    <Card variant="outlined" sx={{ display: "flex", p: 2 }}>
                        <VideocamIcon
                            color="secondary"
                            sx={{ fontSize: 40, mr: 2 }}
                        />
                        <Box flexGrow={1}>
                            <Typography variant="h6">
                                {t("VideoInterview")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t(
                                    "Aday, kendisine yöneltilen sorulara kısa videolar çekerek cevap verir."
                                )}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleInterviewInvitation('video')}
                            disabled={!selectedInterview && interviewInvitation.isLoading}
                            startIcon={
                                interviewInvitation.isLoading && typeLoading === 'video' && (
                                    <CircularProgress size={20} color="inherit" />
                                )
                            }
                            sx={{
                                height: '100%', marginTop: "2px",

                                '&:hover': {
                                    backgroundColor: '#9a27af',
                                },
                                marginLeft: "20px"
                            }}
                        >
                            {interviewInvitation.isLoading && typeLoading === 'video'
                                ? t("Sending")
                                : t("send")}
                        </Button>
                    </Card>
                </Grid>
            }
        </>
    )
}

export default InterviewSend