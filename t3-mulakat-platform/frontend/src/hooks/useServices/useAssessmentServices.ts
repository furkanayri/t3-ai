import { useMutation, useQuery } from "@tanstack/react-query";
import {
    getAssessmentProcessesService,
    createAssessmentProcessService,
    getAssessmentProcessService,
    updateAssessmentProcessService,
    deleteAssessmentProcessService,
    createAssessmentStageService,
    updateAssessmentStageService,
    deleteAssessmentStageService,
    reorderAssessmentStagesService,
    assignAssessmentProcessService,
    getMyAssessmentService,
    getMyAssessmentsService,
    startAssessmentStageService,
} from "src/services/assessmentServices";

// ---- Admin / tenant ----
export function useGetAssessmentProcessesQuery() {
    return useQuery(['assessment-processes'], () => getAssessmentProcessesService());
}

export function useGetAssessmentProcessQuery({ processId }: { processId: string }) {
    return useQuery(['assessment-process', processId], () => getAssessmentProcessService({ processId }), {
        enabled: !!processId,
    });
}

export function useCreateAssessmentProcessMutation() {
    return useMutation(createAssessmentProcessService);
}

export function useUpdateAssessmentProcessMutation() {
    return useMutation(updateAssessmentProcessService);
}

export function useDeleteAssessmentProcessMutation() {
    return useMutation(deleteAssessmentProcessService);
}

export function useCreateAssessmentStageMutation() {
    return useMutation(createAssessmentStageService);
}

export function useUpdateAssessmentStageMutation() {
    return useMutation(updateAssessmentStageService);
}

export function useDeleteAssessmentStageMutation() {
    return useMutation(deleteAssessmentStageService);
}

export function useReorderAssessmentStagesMutation() {
    return useMutation(reorderAssessmentStagesService);
}

export function useAssignAssessmentProcessMutation() {
    return useMutation(assignAssessmentProcessService);
}

// ---- Aday ----
export function useGetMyAssessmentsQuery() {
    return useQuery(['my-assessments'], () => getMyAssessmentsService());
}

export function useGetMyAssessmentQuery(assignmentId?: string) {
    return useQuery(['my-assessment', assignmentId], () => getMyAssessmentService({ assignmentId }), {
        enabled: !!assignmentId,
    });
}

export function useStartAssessmentStageMutation() {
    return useMutation(startAssessmentStageService);
}
