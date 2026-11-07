import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useFormik, FormikHelpers } from "formik";
import { useSnackbar } from "notistack";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { useGetAllOnboardingWorkflowsQuery, useGetMyEmployeeDataQuery } from "src/hooks/useServices";
import { CandidateOnboardingPayload } from "src/types/CandidateOnboarding";
import { useDetailJob } from "../../DetailJobProvider";
import { useAuth } from "src/providers";
import { useParams } from "react-router";
import { useCreateCandidateOnboardingMutation } from "src/hooks/useServices/useCandidateOnboardingServices";

type IPropTypes = {
    open: boolean,
    onClose: () => void,
    dialogData: any,
    setDialogData: Dispatch<SetStateAction<any>>
}

export default function StartOnboardingDialog({ open, onClose, dialogData, setDialogData }: IPropTypes) {
    const { enqueueSnackbar } = useSnackbar()
    const { t } = useTranslation()
    const { id: jobId } = useParams()

    //TODO: user employee info move to useAuth or useDetailJob hooks
    const myEmployeeDataQuery = useGetMyEmployeeDataQuery();
    const employee = myEmployeeDataQuery?.data?.employee;

    const workflowsQuery = useGetAllOnboardingWorkflowsQuery();
    const workflows = workflowsQuery.data?.results;

    const application = dialogData?.application


    const initialValues: any = {
        candidateId: application?.candidateId?._id,
        employeeId: employee?._id ?? "",
        jobId: jobId ?? "",
        jobApplicationId: application?._id ?? "",
        onboardingWorkflowId: "",
        amountAndCurrency: {
            amount: 0,
            currency: 'TRY',
            status: 'pending'
        }
    }

    const createOnboardingMutation = useCreateCandidateOnboardingMutation()
    const handleSubmitForm = (values: any, helpers: FormikHelpers<CandidateOnboardingPayload>) => {
        createOnboardingMutation.mutate({
            payload: values
        }, {
            onSuccess: (data) => {
                enqueueSnackbar(t('onboardingSuccessMessage'), { variant: 'success' })
                onClose()
            },
            onError: (error) => {
                enqueueSnackbar(t('errorOnboarding'), { variant: 'error' })
            }
        })
    }

    const { handleSubmit, setFieldValue, values, handleBlur, touched, errors, handleChange } = useFormik({
        initialValues,
        enableReinitialize: true,
        onSubmit: handleSubmitForm,
    });

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
            <DialogTitle id="alert-dialog-title">{t("startOnboarding")}</DialogTitle>
            <Divider sx={{ borderColor: 'lightgray', width: "95%", mx: "auto" }} />
            <DialogContent>
                <div className="flex gap-4 mb-4 justify-between">
                    <div>
                        <p className="text-sm font-semibold">{t("Candidate")}</p>
                        <div className="flex items-center gap-3">
                            <Avatar variant="rounded">{application?.candidateId?.name?.[0] + application?.candidateId?.surname?.[0]}</Avatar>
                            <div>
                                <p className="font-semibold">{application?.candidateId?.name} {application?.candidateId?.surname}</p>
                                <p className="text-sm">{application?.candidateId?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{t("employee")}</p>
                        <div className="flex items-center gap-3">
                            <Avatar variant="rounded">{employee?.name?.[0] + employee?.surname?.[0]}</Avatar>
                            <div>
                                <p className="font-semibold">{employee?.name} {employee?.surname}</p>
                                <p className="text-sm">{employee?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="pt-4">
                    <div className="flex gap-2 flex-col">
                        <div className="flex items-center gap-2">
                            <TextField
                                type="number"
                                label={'Maaş'}
                                name={'amountAndCurrency.amount'}
                                onChange={handleChange}
                                value={values.amountAndCurrency?.amount}
                                fullWidth
                            />
                            <div>
                                <Select
                                    name="amountAndCurrency.currency"
                                    value={values.amountAndCurrency?.currency}
                                    onChange={handleChange}
                                    sx={{ width: '160px' }}
                                    size={'medium'}
                                >
                                    {[
                                        { code: 'USD', symbolText: '$' },
                                        { code: 'EUR', symbolText: '€' },
                                        { code: 'TRY', symbolText: '₺' },
                                    ].map((formType) => (
                                        <MenuItem
                                            value={formType.code}
                                            key={formType.code}
                                        >
                                            {formType.code} ({formType.symbolText})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>

                        </div>
                        <TextField
                            fullWidth
                            label={t("onboardingTemplate")}
                            name="onboardingWorkflowId"
                            onChange={handleChange}
                            value={values.onboardingWorkflowId ?? ''}
                            size="medium"
                            variant="outlined"
                            onBlur={handleBlur}
                            error={touched.onboardingWorkflowId && !!errors.onboardingWorkflowId}
                            // helperText={touched.onboardingWorkflowId && errors.onboardingWorkflowId}
                            required
                            select
                        >
                            {workflows?.map((item: any) => (
                                <MenuItem
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.title}
                                </MenuItem>
                            ))}
                        </TextField>
                        <DialogActions>
                            <Button color="inherit" onClick={onClose}>{t('Cancel')}</Button>
                            <Button type="submit" autoFocus >{t('Save')}</Button>
                        </DialogActions>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    )
}
