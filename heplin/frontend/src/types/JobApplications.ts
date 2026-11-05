export type JobApplicationStatus =
    "applied" |
    "onBoarding" |
    "hired" |
    "cancelledByCandidate" |
    "disqualified"

export type JobApplication = {
    _id?: string;
    candidateId: string;
    userId: string;
    cv: string;
    coverLetter?: string;
    currentRecruitmentStepId: string;
    applicantAnswers: {
        questionId: string;
        answer: any;
        isMatching?: boolean;
    }[];
    jobId: string;
    tenantId: string;
    note?: string;
    hrNote?: string;
    disqualifyReason?: string;
    surname?: string;
    name?: string;
    employeeId?: any;
    matchingScore: number;
    onboardingId?: string;
    status: JobApplicationStatus
}