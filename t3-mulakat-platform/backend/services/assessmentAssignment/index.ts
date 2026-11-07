import AssessmentAssignment from "@/models/AssessmentAssignment.model"
import { AssessmentAssignmentService } from "./service"

const service = () => new AssessmentAssignmentService(AssessmentAssignment)

export default service
