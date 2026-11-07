import AssessmentStage from "@/models/AssessmentStage.model"
import { AssessmentStageService } from "./service"

const service = () => new AssessmentStageService(AssessmentStage)

export default service
