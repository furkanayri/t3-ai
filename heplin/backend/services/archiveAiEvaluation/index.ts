import ArchiveAiEvaluation from "@/models/ArchiveAiEvaluation.model"
import { ArchiveAiEvaluationService } from "./service"

const service = () => new ArchiveAiEvaluationService(ArchiveAiEvaluation)

export default service