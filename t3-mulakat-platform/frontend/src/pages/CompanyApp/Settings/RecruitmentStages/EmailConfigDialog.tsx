import {
    Dialog,
    DialogTitle,
    DialogContent,
    Stack,
    Divider,
    DialogActions,
    Button,
} from "@mui/material";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
    useGetAllRecruitmentEmailConfigsQuery,
    useGetAllRecruitmentStageStepsQuery,
    useGetRecruitmentStageDetailQuery
} from "src/hooks/useServices";
import { RecruitmentEmailConfig, RecruitmentStage, RecruitmentStageStep } from "src/types";
import { array } from "src/utils";
import { EmailConfigItem } from "./sections";
import { useTranslation } from 'react-i18next';

interface IPropTypes {
    open: boolean,
    closeDialog: () => void,
}
export default function EmailConfigDialog({ open, closeDialog }: IPropTypes) {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams();
    const recruitmentStageId = useMemo(() => searchParams.get('stageId'), [searchParams]) ?? ""

    const stageDetailQuery = useGetRecruitmentStageDetailQuery(recruitmentStageId)
    const stageStepsQuery = useGetAllRecruitmentStageStepsQuery(recruitmentStageId)
    const emailConfigsQuery = useGetAllRecruitmentEmailConfigsQuery(recruitmentStageId)

    const stage: RecruitmentStage = stageDetailQuery?.data?.recruitmentStage
    const stageSteps = array<RecruitmentStageStep>(stageStepsQuery?.data?.results)
    const configs = array<RecruitmentEmailConfig>(emailConfigsQuery?.data?.results)

    return (
        <Dialog
            maxWidth="md"
            fullWidth
            open={open}
            onClose={closeDialog}
            scroll="body"

        >
            <DialogTitle align="center" variant="h5">{t('recruitment_stage_email_settings')}</DialogTitle>
            <Divider sx={{ borderColor: 'lightgray' }} />

            <DialogContent className="bg-slate-100">
                <Stack
                    spacing={2}
                    alignItems={"center"}
                >
                    {stage?.stepsSort?.length && stageSteps?.length ? stage?.stepsSort.map((stepId: string) => {
                        const config = configs.find(c => (c.recruitmentStageStepId as RecruitmentStageStep)?._id === stepId)
                        return !!config ? <EmailConfigItem key={config?._id} config={config} /> : null
                    })
                        : <p>{t('there_are_no_recruitment_steps')}</p>
                    }

                </Stack>
            </DialogContent>
            <Divider sx={{ borderColor: 'lightgray' }} />
            <DialogActions>
                <Button onClick={closeDialog}>{t('close')}</Button>
                <Button onClick={closeDialog}>{t('saveChanges')}</Button>
            </DialogActions>
        </Dialog>
    )
}
