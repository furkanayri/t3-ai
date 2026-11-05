import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { ChangeEvent, Dispatch, SetStateAction, useMemo } from "react";
import { useUpdateJobApplicationEmployeeMutation } from "src/hooks/useServices";
import { useDetailJob } from "../DetailJobProvider";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { array } from "src/utils";


type ManageHiringPersonelData = {
    selectedEmployeeId: string
    currentEmployeeId: string
    candidateId: string
}

type IPropTypes = {
    open: boolean,
    onClose: () => void,
    dialogData: ManageHiringPersonelData,
    setDialogData: Dispatch<SetStateAction<ManageHiringPersonelData>>
}

type PartialEmployee = {
    _id: string,
    name: string,
    surname: string,
    email: string,
}

export default function ManageHiringPersonelDialog({ open, onClose, dialogData, setDialogData }: IPropTypes) {
    const { hiringTeamsState } = useDetailJob();
    const employees = array<PartialEmployee>(hiringTeamsState?.data?.hiringEmployees)

    const { enqueueSnackbar } = useSnackbar()
    const { t } = useTranslation()

    const currentCandidateId = useMemo(() => dialogData?.candidateId, [dialogData])
    const selectedEmployeeId = useMemo(() => dialogData?.selectedEmployeeId, [dialogData])
    const currentEmployeeId = useMemo(() => dialogData?.currentEmployeeId, [dialogData])

    const { jobState } = useDetailJob();
    const jobId = jobState?.data?._id

    const updateJobApplication = useUpdateJobApplicationEmployeeMutation();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (currentCandidateId && selectedEmployeeId && currentEmployeeId) {
            updateJobApplication.mutate({
                jobId: jobId,
                payload: {
                    applicantId: currentCandidateId,
                    newEmployeeId: selectedEmployeeId,
                    currentEmployeeId: currentEmployeeId
                }
            }, {
                onSuccess: () => {
                    enqueueSnackbar(t('Job application updated successfully.'), { variant: 'success' })
                    hiringTeamsState.refetch()
                    onClose()
                },
                onError: (error: any) => {
                    enqueueSnackbar(error, { variant: 'error' })
                }
            });
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDialogData(prev => ({ ...prev, selectedEmployeeId: e.target.value }))
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
            <form onSubmit={handleSubmit}>
                <DialogTitle id="alert-dialog-title">Adayı yeni bir çalışana ata</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        fullWidth
                        label={t("Hiring Personnel")}
                        value={selectedEmployeeId}
                        onChange={handleChange}
                    >
                        {employees?.map((employee: any, ind) => (
                            !!employee &&
                            <MenuItem
                                key={employee?._id + "-hiring-team-" + ind}
                                value={employee?._id}
                            >
                                {employee?.name} {employee?.surname}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={onClose}>{t('Cancel')}</Button>
                    <LoadingButton type="submit" autoFocus >{t('update')}</LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    )
}
