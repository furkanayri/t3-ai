export type CandidateOnboarding = {
    _id: string;
    candidateId: string;
    employeeId: string;
    tenantId: string;
    jobId: string;
    jobApplicationId: string;
    onboardingWorkflowId: string;
    responses: OnboardingResponseItem[];
    reason: string
    status: CandidateOnboardingStatus;
    amountAndCurrency: AmountAndCurrency[]
};

export type AmountAndCurrency = {
    length: number;
    amount: number;
    currency: "USD" | "EUR" | "TRY";
    status: AmountAndCurrencyStatus
};


export type AmountAndCurrencyStatus = "pending" | "accepted" | "reject" | "";

export type CandidateOnboardingStatus = "pending" | "completed" | "cancelled" | 'offerAccepted' | ''

export type CandidateOnboardingPayload = Partial<Omit<CandidateOnboarding, "_id">>;

export type OnboardingResponseItem = {
    _id?: string;
    itemId: string;
    type: "text" | "file";
    title: string;
    description?: string;
    response: any;
};