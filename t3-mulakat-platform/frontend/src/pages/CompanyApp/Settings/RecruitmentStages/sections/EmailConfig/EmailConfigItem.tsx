import { useState } from "react";
import { FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup, Stack, Switch, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { KeyboardArrowDown, KeyboardArrowUp, Save } from "@mui/icons-material";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { RecruitmentEmailConfig, RecruitmentEmailConfigPayload, RecruitmentStageStep } from "src/types";
import { LoadingButton } from "@mui/lab";
import { useUpdateRecruitmentEmailConfigMutation } from "src/hooks/useServices";
import { useSnackbar } from "notistack";
import EmailTemplateEditor from "./EmailTemplateEditor";
import EmailConfigForm from "./EmailConfigForm";

export default function EmailConfigItem({ config }: { config: RecruitmentEmailConfig }) {
    const { t, i18n } = useTranslation();
    const { enqueueSnackbar } = useSnackbar()
    const [isOpen, setOpen] = useState(false);

    const updateEmailConfigMutation = useUpdateRecruitmentEmailConfigMutation()
    const handleClick = () => { setOpen(pre => !pre) };

    const handleSaveConfigChanges = (values: RecruitmentEmailConfigPayload, helpers: FormikHelpers<RecruitmentEmailConfigPayload>) => {
        return updateEmailConfigMutation.mutate({ id: config?._id, payload: values }, {
            onSuccess: (data) => {
                enqueueSnackbar(t("Step email config updated"), { variant: "success" })
            },
            onError: (err: any) => {
                enqueueSnackbar(err?.message, { variant: "error" })
            },
            onSettled: () => {
                helpers.setSubmitting(false)
            }
        })
    }

    const step = config.recruitmentStageStepId as RecruitmentStageStep;
    return (
        <div className=" bg-white py-2 px-4 border-2 border-slate-300 max-w-2xl w-full">
            <div onClick={handleClick} className="flex items-center justify-between cursor-pointer">
                <div className="flex gap-4 items-center">
                    <div style={{ background: step?.color ?? "gray" }} className="h-6 w-6"></div>
                    <div className="space-y-2">
                        <Typography variant="h6">
                            {step.title.toLocaleUpperCase(i18n.language)}
                        </Typography>
                    </div>
                </div>
                {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </div>
            {isOpen ?
                <Formik
                    initialValues={{
                        isEmailsActive: config.isEmailsActive,
                        emailFlow: config.emailFlow,
                        content: config?.content,
                        title: config?.title,
                    } as RecruitmentEmailConfigPayload}
                    onSubmit={handleSaveConfigChanges}
                >
                    {({ dirty, isSubmitting, isValid }) => (
                        <Form>
                            <Stack spacing={2} marginY={2}>
                                <EmailConfigForm />
                                <EmailTemplateEditor name="content" />
                            </Stack>
                            {dirty && (
                                <div className="flex justify-end">
                                    <LoadingButton
                                        type="submit"
                                        startIcon={<Save />}
                                        loading={isSubmitting}
                                        disabled={!isValid}
                                    >
                                        {t('saveChanges')}
                                    </LoadingButton>
                                </div>
                            )}
                        </Form>
                    )}
                </Formik>
                : null}
        </div>
    );
}
