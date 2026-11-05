import { IconButton, Tooltip, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { RecruitmentStage, RecruitmentStageStep } from "src/types";
import { Delete, DragIndicator } from '@mui/icons-material';
import { useTranslation } from "react-i18next";

interface IPropTypes {
    stageStepsList: RecruitmentStageStep[],
    setStageStepsList: Dispatch<SetStateAction<RecruitmentStageStep[]>>
    updateStage: (stage: RecruitmentStage) => Promise<void>
    handleDelete: (id: string) => void
    stage: RecruitmentStage
}

export default function StepsOrder({ stageStepsList, setStageStepsList, updateStage, handleDelete, stage }: IPropTypes) {
    const { t, i18n } = useTranslation()

    const reorder = (list: RecruitmentStageStep[], startIndex: any, endIndex: any) => {
        const result = Array.from(list); 1
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragEnd = async (result: DropResult, provided: ResponderProvided): Promise<void> => {
        if (!result.destination || result.destination.index === result.source.index) {
            return;
        }

        const newStageStepsList = reorder(
            stageStepsList,
            result.source.index,
            result.destination.index
        );

        setStageStepsList(newStageStepsList);

        const idList = newStageStepsList.map(item => item?._id)
        await updateStage({ ...stage, stepsSort: idList })
    };

    return (
        <div>
            <div className='grid grid-cols-6 border-b-2 mb-4 py-1'>
                <div className='col-span-2'>
                    <Typography variant='caption' fontSize={14}>{t("Title")}</Typography>
                </div>
                <div className='col-span-2'>
                    <Typography variant='caption' fontSize={14}>{t("Description")}</Typography>
                </div>
                <div className='justify-self-end'>
                    <Typography variant='caption' fontSize={14}>{t("Color")}</Typography>
                </div>
                <div className='justify-self-end'>
                    <Typography variant='caption' fontSize={14}>{t("Actions")}</Typography>
                </div>
            </div>
            <div className='col-span-4'>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {stageStepsList?.length && stageStepsList?.map((step, index) => (
                                    <Draggable key={step._id} draggableId={step._id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    // backgroundColor: snapshot.isDragging ? "2px solid ##6366F1" : "transparent",
                                                    ...provided?.draggableProps?.style,
                                                }}
                                            >
                                                <div className='grid grid-cols-6 py-[2px] items-center'>
                                                    <div className='col-span-2 flex items-center'>
                                                        <DragIndicator color='disabled' />
                                                        <Typography variant='h6' paddingLeft={1}>{step.title}</Typography>
                                                    </div>
                                                    <div className='col-span-2'>
                                                        <Typography variant='body1'>{step.description}</Typography>
                                                    </div>
                                                    <div className='justify-self-end'>
                                                        <Tooltip title={
                                                            i18n.language === 'tr' ?
                                                                t(step?.color ?? "-").toLocaleUpperCase("tr-TR")
                                                                : t(step?.color ?? "-").toUpperCase()
                                                        }>
                                                            <div className='w-6 h-6' style={{ background: step.color }}></div>
                                                        </Tooltip>
                                                    </div>
                                                    <div className='justify-self-end'>
                                                        <Tooltip title={t("Delete step")}>
                                                            <IconButton onClick={() => handleDelete(step?._id)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext></div>
        </div>
    )
}