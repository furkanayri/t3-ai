import AiEvaluation from "@/models/AiEvaluation.model"
import { AiEvaluationService } from "./service"

const service = () => new AiEvaluationService(AiEvaluation)

export default service