import AssessmentStageProgress from "@/models/AssessmentStageProgress.model"
import { AssessmentStageProgressService } from "./service"

const service = () => new AssessmentStageProgressService(AssessmentStageProgress)

export default service
