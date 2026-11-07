export type OnboardingWorkflow = {
    _id: string
    title: string
    description?: string
    items: {
        _id: string;
        type: "file" | "text";
        title: string;
        description?: string;
    }[]
}


export type OnboardingWorkflowPayload = {
    title: string
    description?: string,
    items: {
        type: string;
        title: string;
        description?: string;
    }[]
}
export type OnboardingResponse = {
    _id: string;
}