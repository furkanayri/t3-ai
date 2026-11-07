import { tenantApiClient } from "src/libs/apiClient";

export interface QuizQuestion {
    _id?: string;
    title: string;
    description?: string;
    question: string;
    categoryId?: string;
    options: {
        text: string;
        isCorrect: boolean;
        optionId?: string;
    }[];
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    timeLimit?: number;
    tags?: string[];
    explanation?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface QuizQuestionListParams {
    page?: number;
    limit?: number;
    categoryId?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    tag?: string;
    isActive?: boolean;
    search?: string;
}

// 1. Tüm soruları getir
export async function getAllQuestions(params?: QuizQuestionListParams) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const res = await tenantApiClient.get(`/quiz-questions${queryString}`);
    return res.data;
}

// 2. Yeni soru oluştur
export async function createQuestion(questionData: Omit<QuizQuestion, '_id' | 'createdAt' | 'updatedAt'>) {
    const res = await tenantApiClient.post('/quiz-questions', questionData);
    return res.data;
}

// 3. Tek soru getir
export async function getQuestion(questionId: string) {
    const res = await tenantApiClient.get(`/quiz-questions/${questionId}`);
    return res.data;
}

// 4. Soru güncelle
export async function updateQuestion(questionId: string, questionData: Partial<QuizQuestion>) {
    const res = await tenantApiClient.put(`/quiz-questions/${questionId}`, questionData);
    return res.data;
}

// 5. Soru sil
export async function deleteQuestion(questionId: string) {
    const res = await tenantApiClient.delete(`/quiz-questions/${questionId}`);
    return res.data;
}

// 6. Kategoriye göre sorular
export async function getQuestionsByCategory(categoryId: string, params?: Omit<QuizQuestionListParams, 'categoryId'>) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const res = await tenantApiClient.get(`/quiz-questions/category/${categoryId}${queryString}`);
    return res.data;
}

// 7. Rastgele sorular
export async function getRandomQuestions(params?: {
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    categoryId?: string;
    excludeIds?: string[];
}) {
    const queryParams = new URLSearchParams();

    if (params?.count) queryParams.append('count', params.count.toString());
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.excludeIds?.length) {
        params.excludeIds.forEach(id => queryParams.append('excludeIds', id));
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const res = await tenantApiClient.get(`/quiz-questions/random${queryString}`);
    return res.data;
}

// 8. Soru istatistikleri
export async function getQuestionStatistics() {
    const res = await tenantApiClient.get('/quiz-questions/statistics');
    return res.data;
}

// 9. Soru aktif/pasif yap
export async function toggleQuestionStatus(questionId: string, isActive: boolean) {
    const res = await tenantApiClient.patch(`/quiz-questions/${questionId}/toggle`, { isActive });
    return res.data;
}

// 10. Excel'den toplu import
export async function bulkImportFromExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await tenantApiClient.post('/quiz-questions/bulk-import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
}

// 11. Excel template indir
export async function downloadExcelTemplate() {
    const res = await tenantApiClient.get('/quiz-questions/excel-template', {
        responseType: 'blob',
    });
    return res.data;
}
// 12. Excel dosyası doğrula
export async function validateExcelFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await tenantApiClient.post('/quiz-questions/validate-excel', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
}

// Bonus: Çoklu işlemler

// Çoklu soru silme
export async function deleteMultipleQuestions(questionIds: string[]) {
    const res = await tenantApiClient.post('/quiz-questions/bulk-delete', { questionIds });
    return res.data;
}

// Çoklu soru aktif/pasif yapma
export async function toggleMultipleQuestions(questionIds: string[], isActive: boolean) {
    const res = await tenantApiClient.post('/quiz-questions/bulk-toggle', { questionIds, isActive });
    return res.data;
}

// Soru kopyalama
export async function duplicateQuestion(questionId: string) {
    const res = await tenantApiClient.post(`/quiz-questions/${questionId}/duplicate`);
    return res.data;
}
