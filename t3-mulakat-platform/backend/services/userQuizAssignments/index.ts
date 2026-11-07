import UserQuizAssignments from "@/models/UserQuizAssignments.model"
import { UserQuizAssignmentsService } from "./service"

const service = () => new UserQuizAssignmentsService(UserQuizAssignments)

export default service