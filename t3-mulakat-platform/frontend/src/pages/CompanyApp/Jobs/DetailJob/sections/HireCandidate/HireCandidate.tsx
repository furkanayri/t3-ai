import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useUpdateApplicant } from "src/hooks/useServices";

type IPropTypes = {
    open: any
    onClose: any
    dialogData: any
}

const HireCandidate = ({ open, onClose, dialogData }: IPropTypes) => {
    const { t } = useTranslation()
    const { id } = useParams()

    const candidateId = useMemo(() => dialogData?.candidateId, [dialogData])
    const application = useMemo(() => dialogData?.application, [dialogData])

    // FIXME: change "applicant" in naming to application (this mutation changes the jobApplication)
    const applicantMutation = useUpdateApplicant()

    const handleHireCandidate = () => {
        const payload = {
            status: 'hired',
            candidateId: candidateId,
        }
        applicantMutation.mutateAsync({
            jobId: id ?? '',
            payload: payload
        }, {
            onSuccess() {
                onClose()
                enqueueSnackbar({
                    message: t('Candidatehiredsuccess'),
                    variant: "success"
                })
            },
            onError(error: any) {
                enqueueSnackbar({
                    message: error.message,
                    variant: "error"
                })
            },
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
                    minWidth: '600px',
                    maxWidth: '80%',
                    width: 'auto',
                    height: 'auto',
                }
            }}
        >
            <DialogTitle id="alert-dialog-title">{t("hiringCandidate") + `: ${application?.candidateId?.name} ${application?.candidateId?.surname}`}</DialogTitle>
            <DialogContent>
                <div>
                    <p className="font-medium">
                        {t("areYouSureYouWantToHire")}
                    </p>
                    <DialogActions>
                        <Button color="inherit" onClick={onClose}>{t('Cancel')}</Button>
                        <Button type="submit" autoFocus onClick={handleHireCandidate}>{t('Save')}</Button>
                    </DialogActions>
                </div>
            </DialogContent>
        </Dialog >
    )
}

export default HireCandidate