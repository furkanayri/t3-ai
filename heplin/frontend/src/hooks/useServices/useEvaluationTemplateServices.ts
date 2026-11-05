import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createEvaluationCandidateTemplateMutation,
  createEvaluationTemplateService,
  deleteEvaluationTemplateService,
  getAllEvaluationTemplatesService,
  getOneEvaluationTemplateService,
  updateEvaluationTemplateService
} from "src/services";

export function useGetAllEvaluationTemplates(query?: string) {
  return useQuery(["evaluation-templates", query], () => getAllEvaluationTemplatesService(query), { keepPreviousData: true })
}
export function useGetOneEvaluationTemplate({ id, enabled }: { id: string, enabled: boolean }) {
  return useQuery(["evaluation-template-detail", id, enabled], () => getOneEvaluationTemplateService(id), { enabled })
}
export function useCreateEvaluationTemplateMutation() {
  return useMutation(createEvaluationTemplateService);
}
export function useCreateEvaluationCandidateTemplateMutation() {
  return useMutation(createEvaluationCandidateTemplateMutation);
}
export function useUpdateEvaluationTemplateMutation() {
  return useMutation(updateEvaluationTemplateService);
}
export function useDeleteEvaluationTemplateMutation() {
  return useMutation(deleteEvaluationTemplateService);
}
