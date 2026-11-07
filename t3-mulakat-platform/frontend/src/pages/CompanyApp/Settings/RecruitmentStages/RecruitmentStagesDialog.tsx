import { useEffect, useMemo, useState } from 'react'
import { CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useDeleteRecruitmentStageStepMutation, useGetAllRecruitmentStageStepsQuery, useGetRecruitmentStageDetailQuery, usePostNewRecruitmentStageStepMutation, useUpdateRecruitmentStageMutation } from 'src/hooks/useServices';
import { useSnackbar } from 'notistack';
import { useSearchParams } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup'
import { CreateStep, StepsOrder } from './sections';
import { RecruitmentStage, RecruitmentStageStep, RecruitmentStageStepPayload } from 'src/types';
import { array } from 'src/utils';


type IPropTypes = {
    closeDialog: () => void;
    open: boolean;
    refetchRecruitmentStages: () => void
}

const stepSchema = yup.object().shape({
    title: yup.string().required(),
    description: yup.string(),
    color: yup.string().required(),
})

export default function RecruitmentStagesDialog({ open, closeDialog, refetchRecruitmentStages }: IPropTypes) {
    const [searchParams, setSearchParams] = useSearchParams();

    const [stageStepsList, setStageStepsList] = useState<RecruitmentStageStep[]>([])

    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar();

    const recruitmentStageId = useMemo(() => searchParams.get('stageId'), [searchParams]) ?? ""

    const stageDetailQuery = useGetRecruitmentStageDetailQuery(recruitmentStageId)
    const stage: RecruitmentStage = useMemo(() => stageDetailQuery?.data?.recruitmentStage, [stageDetailQuery?.data])
    const stageStepsQuery = useGetAllRecruitmentStageStepsQuery(recruitmentStageId)
    const stageSteps = useMemo(() => array<RecruitmentStageStep>(stageStepsQuery?.data?.results), [stageStepsQuery?.data])

    const orderedStepsList = useMemo(() => {
        if (stage && stageSteps && stageSteps?.length && stage?.stepsSort?.length) {
            let list: RecruitmentStageStep[] = []
            stage?.stepsSort?.map((stepId: any) => {
                let matchObj = stageSteps.find((step) => step._id === stepId._id)
                if (!!matchObj) list.push(matchObj)
            })
            setStageStepsList(list)
            return list
        }

        return []
    }, [stage, stageSteps])
    const createStageStepsMutation = usePostNewRecruitmentStageStepMutation()
    const deleteStageStepsMutation = useDeleteRecruitmentStageStepMutation()
    const updateRecruitmentStageMutation = useUpdateRecruitmentStageMutation()

    const handleCreateStep = async (values: RecruitmentStageStepPayload, helpers: FormikHelpers<RecruitmentStageStepPayload>) => {
        await createStageStepsMutation.mutateAsync({ recruitmentStageId, payload: { ...values, recruitmentStageId } }, {
            onSuccess: async (data) => {
                const newStep: RecruitmentStageStep = data?.recruitmentStageStep
                if (!newStep) return

                const newStage: RecruitmentStage = {
                    ...stage,
                    stepsSort: [...stage.stepsSort, newStep?._id]
                }
                await updateStage(newStage)
                stageStepsQuery.refetch()
                helpers.resetForm()
            },
            onError: (err) => {
                enqueueSnackbar((err as any).message ?? err, { variant: 'error' });
            },
        }
        )
    }

    const updateStage = async (stage: RecruitmentStage) => {
        const updateArgs = {
            id: stage?._id,
            payload: stage
        }
        await updateRecruitmentStageMutation.mutateAsync(updateArgs, {
            onSuccess: (data) => {
                enqueueSnackbar(t('savedChanges'), { variant: 'success' });
                refetchRecruitmentStages()
                stageDetailQuery.refetch()
                stageStepsQuery.refetch()
            },
            onError: (err) => {
                enqueueSnackbar((err as any).message ?? err, { variant: 'error' });
            },
        })
    }

    const handleDelete = (id: string) => {
        deleteStageStepsMutation.mutateAsync({ id, recruitmentStageId }, {
            onSuccess: async (data: { isSuccess: boolean, _id: string }) => {
                const deletedStepId = data._id

                const updateStagePayload = {
                    ...stage,
                    stepsSort: stage.stepsSort.filter(stepId => stepId !== deletedStepId)
                }
                await updateStage(updateStagePayload)
                enqueueSnackbar(t('Step deleted'), { variant: 'info' });
                stageStepsQuery.refetch()
            },
            onError: (err) => {
                enqueueSnackbar((err as any).message ?? err, { variant: 'error' });
            },
        }
        )
    }

    const initialStepValues: RecruitmentStageStepPayload = {
        title: "",
        description: "",
        color: 'Grey',
        recruitmentStageId: recruitmentStageId,
    }

    return <Dialog
        fullWidth
        maxWidth="xl"
        open={open}
        onClose={closeDialog}
    >
        <DialogTitle>{stage?.title}</DialogTitle>
        <Divider sx={{ borderColor: 'lightgray', width: "97%", marginInline: "auto" }} />
        <DialogContent>
            <div className='flex gap-8 flex-col md:flex-row'>
                <div className='w-full md:w-[35%]'>
                    <Formik
                        initialValues={initialStepValues}
                        onSubmit={handleCreateStep}
                        validationSchema={stepSchema}
                    >
                        {({ handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <CreateStep />
                            </form>
                        )}
                    </Formik>
                </div>
                <div className="w-full md:w-[65%]">

                    {stageStepsQuery.isLoading || stageDetailQuery.isLoading ?
                        <div className='h-full flex items-center justify-center'><CircularProgress /></div> :
                        orderedStepsList?.length ? (
                            <StepsOrder
                                stageStepsList={stageStepsList}
                                setStageStepsList={setStageStepsList}
                                updateStage={updateStage}
                                handleDelete={handleDelete}
                                stage={stage}
                            />
                        ) :
                            <p className='mt-4'> *{t("No Recruitment Steps added yet")}</p>}
                </div>
            </div>
            <div className='flex justify-end items-center pt-4'>
                <Typography variant='subtitle2'>{stageStepsList?.length ? t("*Drag and drop items to rearrange the order") : ""}</Typography>
            </div>
        </DialogContent>
    </Dialog>

}