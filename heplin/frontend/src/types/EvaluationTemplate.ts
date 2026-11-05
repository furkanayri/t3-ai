export type EvaluationTemplate = {
    _id: string,
    title: string,
    scoreCards: EvaluationScoreCard[],
    fields: EvaluationField[]
}

export type EvaluationScoreCard = {
    _id?: string
    title: string
    description?: string
}

export type EvaluationField = {
    _id?: string
    title: string
    description?: string
    //TODO: add more types as types are added to backend enum in model
    type: "multiline"
}

export type EvaluationTemplatePayload = {
    title: string,
    scoreCards: EvaluationScoreCard[],
    fields: EvaluationField[]
}