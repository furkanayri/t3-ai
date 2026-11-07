import apiClient from 'src/libs/apiClient';

interface AnswerType {
    questionIndex: number;
    selectedOption: string;
    answerKey?: string;
    questionText?: string;
    trait?: string;
    optionText?: string;
}

export async function generateQuestionsService() {
    const res = await apiClient.post('/v1/generate-questions');
    return res.data;
}

export async function evaluateAnswersService({ answers, userId }: { answers: AnswerType[]; userId: string }) {
    const res = await apiClient.post('/v1/evaluate-answers', { answers, userId });
    return res.data;
}

export async function getPersonalTestService({ candidateId }: { candidateId: string }) {
    const res = await apiClient.get(
        `/v1/candidates/${candidateId}/personalTest`
    );

    return res.data;
}
