import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from "@mui/material";
import { Formik, FormikHelpers } from "formik";
import { Dispatch, SetStateAction, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetAllEvaluationTemplates, useGetMyEmployeeDataQuery } from "src/hooks/useServices";
import { CandidateEvaluationPayload } from "src/types";
import { EvaluationForm, SelectTemplate } from "./sections";
import { array } from "src/utils";
import { EvaluationTemplate } from "src/types/EvaluationTemplate";
import { useCreateCandidateEvaluation } from "src/hooks/useServices/useCandidateEvaluation";
import { useParams } from 'react-router-dom';
import { useSnackbar } from "notistack";

type EvaluateCandidateData = {
    candidateId: string
    employeeId: string
    application: any
}

type IPropTypes = {
    open: boolean, onClose: () => void,
    dialogData: EvaluateCandidateData,
    setDialogData: Dispatch<SetStateAction<EvaluateCandidateData>>
}

export default function EvaluateCandidateDialog({ open, onClose, dialogData, setDialogData }: IPropTypes) {
    const { t } = useTranslation()
    const candidateId = useMemo(() => dialogData?.candidateId, [dialogData])
    const application = useMemo(() => dialogData?.application, [dialogData])

    const { id: jobId } = useParams()
    const { enqueueSnackbar } = useSnackbar();

    //TODO: move to useAuth or useDetailJob hooks
    const myEmployeeDataQuery = useGetMyEmployeeDataQuery();
    const employee = myEmployeeDataQuery?.data?.employee;

    const evaluationTemplatesQuery = useGetAllEvaluationTemplates()
    const evaluationTemplates = useMemo(() => array<EvaluationTemplate>(evaluationTemplatesQuery?.data?.results), [evaluationTemplatesQuery?.data])

    const initialValues: CandidateEvaluationPayload = {
        evaluationTemplateId: '',
        employeeId: employee?._id ?? '',
        candidateId: candidateId ?? '',
        jobId: jobId ?? '',
        recruitmentStepId: '',
        score: 0,
        scoreCard: [],
        fields: [],
    }

    const candidateEvaluationMutation = useCreateCandidateEvaluation()
    const handleSubmitForm = (values: any, helpers: FormikHelpers<any>) => {
        const scoreMapper: { [key: string]: number } = {
            "no": 1,
            "not-sure": 2,
            "yes": 3,
            "strong-yes": 4
        };

        const total = values.scoreCard.reduce((sum: number, item: any) => {
            return sum + scoreMapper[item.score];
        }, 0);

        const scoreAverage = total / (values.scoreCard.length * 4);
        const percentage = scoreAverage * 100;

        const payload = {
            candidateId: candidateId,
            content: {
                ...values,
                score: percentage,
                recruitmentStepId: application?.currentRecruitmentStepId?.recruitmentStageId
            }
        }

        candidateEvaluationMutation.mutateAsync(payload, {
            onSuccess: () => {
                onClose()
                setDialogData({ candidateId: '', employeeId: '', application: null })
                enqueueSnackbar(t('Evaluation has been created successfully'), { variant: 'success' });
            },
            onError: () => {
                helpers.setSubmitting(false)
                enqueueSnackbar('Error', { variant: 'error' });
            }
        })

    }


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
                    minWidth: '900px',
                    maxWidth: '80%',
                    width: 'auto',
                    height: 'auto',
                }
            }}
        >
            <DialogTitle id="alert-dialog-title">{t('evaluateCandidate')} </DialogTitle>
            <Divider sx={{ borderColor: 'lightgray', width: "95%", mx: "auto" }} />
            <DialogContent>
                <div className="flex gap-4 mb-4 justify-between">
                    <div>
                        <p className="text-sm font-semibold">{t('candidate')}</p>
                        <div className="flex items-center gap-3">
                            <Avatar variant="rounded">{application?.candidateId?.name?.[0] + application?.candidateId?.surname?.[0]}</Avatar>
                            <div>
                                <p className="font-semibold">{application?.candidateId?.name} {application?.candidateId?.surname}</p>
                                <p className="text-sm">{application?.candidateId?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{t('Evaluator')}</p>
                        <div className="flex items-center gap-3">
                            <Avatar variant="rounded">{employee?.name?.[0] + employee?.surname?.[0]}</Avatar>
                            <div>
                                <p className="font-semibold">{employee?.name} {employee?.surname}</p>
                                <p className="text-sm">{employee?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold mb-2">{t('Evaluationform')}</p>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={handleSubmitForm}
                        enableReinitialize
                    // validationSchema: stageSchema
                    >
                        {({ handleSubmit }) => (
                            <form onSubmit={handleSubmit} className="space-y-2">
                                <SelectTemplate items={evaluationTemplates} />
                                <EvaluationForm templates={evaluationTemplates} />
                                <DialogActions>
                                    <Button color="inherit" onClick={onClose}>{t('Cancel')}</Button>
                                    <Button type="submit" autoFocus >{t('send')}</Button>
                                </DialogActions>
                            </form>
                        )}
                    </Formik>
                </div>
            </DialogContent>
        </Dialog>
    )
}
