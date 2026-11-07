import AssessmentProcess from "@/models/AssessmentProcess.model"
import { AssessmentProcessService } from "./service"

const service = () => new AssessmentProcessService(AssessmentProcess)

export default service
