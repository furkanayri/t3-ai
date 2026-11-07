export interface Quotas {
    email: {
        credit: number;
        remainingCredit: number;
    };
    job: {
        credit: number;
        remainingCredit: number;
    };
    aiFeatures: {
        interview: {
            isActive: boolean;
            maxAllowed: number;
            remainingCount: number;
        };
        evaluation: {
            isActive: boolean;
            maxAllowed: number;
            remainingCount: number;
        };
        videoInterview: {
            isActive: boolean;
            maxAllowed: number;
            remainingCount: number;
        };
    };
}
