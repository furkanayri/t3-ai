export type CandidateEvaluation = {
    _id: string
    evaluationTemplateId: string
    employeeId: string
    candidateId: string
    jobId: string | undefined
    recruitmentStepId: string | undefined
    note?: string
    score: number | undefined
    scoreCard: CandidateEvaluationScoreCard
    fields: CandidateEvaluationFields
    // allScoreCardsFilled:boolean
    // allFieldsFilled:boolean
}

export type CandidateEvaluationPayload = Omit<CandidateEvaluation, '_id'>

export type CandidateEvaluationScoreCard = Array<{
    itemId: string
    score: CandidateEvaluationScoreType
}>
export type CandidateEvaluationFields = Array<{
    fieldId: string
    answer: string
}>

export type CandidateEvaluationScoreType = "no" | "not-sure" | "yes" | "strong-yes"
