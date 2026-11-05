import { apiClient, tenantApiClient } from "src/libs/apiClient";

// Quiz Session için payload tipleri
export interface QuizSessionQuestion {
    id: string;
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    selectedOptionId?: string;
    order: number;
}

export interface QuizSessionData {
    id: string;
    sessionId: string;
    assignmentId: string;
    userId: string;
    quizSetId: string;
    status: 'active' | 'completed' | 'abandoned' | 'timeout';
    startedAt: string;
    completedAt?: string;
    timeLimit?: number;
    remainingTime?: number;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    totalPoints: number;
    maxPossiblePoints: number;
    scorePercentage: number;
    questions: QuizSessionQuestion[];
    answers?: Record<string, string>;
}

export interface SubmitAnswerPayload {
    questionId: string;
    answer: string; // Backend 'answer' field'ı bekliyor
    selectedOptionId?: string; // Backward compatibility
    timeSpent?: number;
}

export interface CompleteQuizPayload {
    answers: Record<string, string>;
}

export interface QuizResultQuestion {
    questionId: string;
    question: string;
    selectedOptionId: string;
    selectedOptionText: string;
    correctOptionId: string;
    correctOptionText: string;
    isCorrect: boolean;
    earnedPoints: number;
    timeSpent?: number;
    options?: {
        id: string;
        text: string;
        isCorrect?: boolean;
    }[];
}

export interface QuizResultsData {
    session: {
        sessionId: string;
        attemptNumber: number;
        totalQuestions: number;
        answeredQuestions: number;
        correctAnswers: number;
        totalPoints: number;
        maxPossiblePoints: number;
        scorePercentage: number;
        totalTimeSpent: number;
        isPassed: boolean;
        passingScore: number;
        startedAt: string;
        completedAt: string;
    };
    answers: QuizResultQuestion[];
    quizSet: {
        title: string;
        description?: string;
    };
}

// GET /api/v1/tenants/:tenantId/quiz-sessions/:sessionId - Session detayı getir
export async function getQuizSessionService(sessionId: string) {
    const res = await tenantApiClient.get(`/quiz-sessions/${sessionId}`);
    return res.data;
}

// POST /api/v1/tenants/:tenantId/quiz-sessions/:sessionId/answer - Cevap kaydet
export async function submitAnswerService(sessionId: string, payload: SubmitAnswerPayload) {
    const res = await tenantApiClient.post(`/quiz-sessions/${sessionId}/answer`, payload);
    return res.data;
}

// POST /api/v1/tenants/:tenantId/quiz-sessions/:sessionId/complete - Quiz tamamla
export async function completeQuizService(sessionId: string, payload?: CompleteQuizPayload) {
    const res = await tenantApiClient.post(`/quiz-sessions/${sessionId}/complete`, payload || {});
    return res.data;
}

// GET /api/v1/tenants/:tenantId/quiz-sessions/:sessionId/results - Sonuçları getir
export async function getSessionResultsService(sessionId: string) {
    const res = await tenantApiClient.get(`/quiz-sessions/${sessionId}/results`);
    return res.data;
}

// ============ ACCOUNTS APP (Candidate) API'leri ============

// GET /api/v1/candidate/quiz-sessions/:sessionId - Candidate session detayı
export async function getCandidateQuizSessionService(sessionId: string) {
    const res = await apiClient.get(`/v1/candidate/quiz-sessions/${sessionId}`);
    return res.data;
}

// POST /api/v1/candidate/quiz-sessions/:sessionId/answer - Candidate cevap gönder
export async function submitCandidateAnswerService(sessionId: string, payload: SubmitAnswerPayload) {
    const res = await apiClient.post(`/v1/candidate/quiz-sessions/${sessionId}/answer`, payload);
    return res.data;
}

// POST /api/v1/candidate/quiz-sessions/:sessionId/complete - Candidate quiz tamamla
export async function completeCandidateQuizService(sessionId: string, payload?: CompleteQuizPayload) {
    const res = await apiClient.post(`/v1/candidate/quiz-sessions/${sessionId}/complete`, payload || {});
    return res.data;
}

// GET /api/v1/candidate/quiz-sessions/:sessionId/results - Candidate sonuçları getir
export async function getCandidateSessionResultsService(sessionId: string) {
    const res = await apiClient.get(`/v1/candidate/quiz-sessions/${sessionId}/results`);
    return res.data;
}
