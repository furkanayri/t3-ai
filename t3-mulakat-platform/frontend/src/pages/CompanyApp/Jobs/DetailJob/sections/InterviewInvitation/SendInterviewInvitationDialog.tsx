import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Badge, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useAiInterviewsAnswersGetAllQuery, useAiInterviewsAnswersQuery, useCreateInterviewInvitation, useUpdateApplicant } from "src/hooks/useServices";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import { useGetAiInterviewQuery } from 'src/hooks/useServices/useInterviewServices';

import { useCreateVideoInterviewInvitation } from "src/hooks/useServices/useAiVideoInterviewServices";
import DescriptionIcon from "@mui/icons-material/Description";
import VideocamIcon from "@mui/icons-material/Videocam";
import { array } from "src/utils";
import InterviewSend from "./component/InterviewSend";
type IPropTypes = {
    open: any
    onClose: any
    dialogData: any
    interviewId: any
    videoInterviewId: any
}

const SendInterviewInvitationDialog = ({ open, onClose, dialogData, interviewId, videoInterviewId }: IPropTypes) => {
    const { t } = useTranslation()
    const { id } = useParams()
    const application = useMemo(() => dialogData?.application, [dialogData])
    const [interview, setInterview] = useState<any>()


    const candidateAnswerQuery = useAiInterviewsAnswersGetAllQuery(interviewId, application?._id);
    const candidateAnswer = candidateAnswerQuery?.data?.results;



    const interviewQuery = useGetAiInterviewQuery()
    const interviewData = array(interviewQuery?.data?.results)


    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: {
                    style: {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    },
                },
            }}
            PaperProps={{
                sx: {
                    minWidth: '400px',
                    maxWidth: '40%',
                    width: 'auto',
                    height: 'auto',
                }
            }}
        >
            <DialogTitle id="alert-dialog-title">
                {
                    application && application.candidateId
                        ? `${t('candidate')}: ${application.candidateId.name ?? ''} ${application.candidateId.surname ?? ''}`
                        : t('candidate')
                }
            </DialogTitle>


            <Divider />
            {
                candidateAnswer?.map((item: any) => {
                    return (
                        item && item?.eventLogs?.length > 0 &&
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                            >
                                <div className="flex items-center gap-2 w-full justify-between">
                                    <Typography>{t("interviewStatus")}</Typography>
                                    <Chip label={t(item?.status)} color="primary" />
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="flex  gap-2 items-end">
                                    <div className="flex items-center gap-1">

                                        <p className="font-normal">
                                            {t('Start Date')} :
                                        </p>
                                        <Chip label={format(new Date(item?.startDate), 'dd/MM/yyyy')} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <p className="font-normal">
                                            {t('End Date')} :
                                        </p>
                                        <Chip label={format(new Date(item?.expirationDate), 'dd/MM/yyyy')} />
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>

                    )

                }
                )

            }


            <DialogContent>

                <Box>
                    <Typography >
                        {t("interviewSend")}
                    </Typography>
                    {candidateAnswer?.length > 0 && (
                        <Typography variant="body2" color="error" gutterBottom>
                            {t("invitesended")}
                        </Typography>
                    )}
                    <Box mt={4}>
                        <Grid container spacing={2}>
                            {/* Yazılı Mülakat Daveti Kartı */}
                            <Grid item xs={12}>

                                <Autocomplete
                                    fullWidth
                                    size='small'
                                    options={interviewData}
                                    value={interview}
                                    onChange={(event, value: any) => setInterview(value)}
                                    isOptionEqualToValue={(option, value) => option.name === value.name}
                                    getOptionLabel={(option) => option.name || ''}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            hiddenLabel
                                            placeholder={t("selectJob")}
                                        />
                                    )}
                                />
                            </Grid>
                            {
                                interview &&
                                <InterviewSend
                                    applicantId={application._id}
                                    selectedInterview={interview}
                                />
                            }


                        </Grid>

                        <DialogActions>
                            <Button color="inherit" onClick={onClose}>
                                {t("Cancel")}
                            </Button>
                        </DialogActions>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SendInterviewInvitationDialog;
