import { STEP_COLORS } from "src/constants"

export type RecruitmentStage = {
    _id: string
    title: string
    description?: string
    stepsSort: string[]
}


export type RecruitmentStagePayload = {
    title: string
    description?: string
    stepsSort: string[] | []
}

export type RecruitmentStageStep = {
    _id: string
    title: string
    description?: string
    color?: StepColor
    recruitmentStageId: string
}

export type StepColor = typeof STEP_COLORS[number];

export type RecruitmentStageStepPayload = {
    title?: "",
    description?: "",
    color?: StepColor
    recruitmentStageId: string
}

export type RecruitmentEmailConfig = {
    _id: string
    title?: string
    content?: string
    isEmailsActive: boolean
    emailFlow: "auto" | "manual"
    recruitmentStageId: string | RecruitmentStage
    recruitmentStageStepId: string | RecruitmentStageStep
    tenantId?: string
}

export type RecruitmentEmailConfigPayload = {
    title?: string
    content?: string
    isEmailsActive: boolean
    emailFlow?: "auto" | "manual"
    recruitmentStageId?: string | RecruitmentStage
    recruitmentStageStepId?: string | RecruitmentStageStep
}