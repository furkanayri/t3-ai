import UserQuizAnswers from "@/models/UserQuizAnswers.model"
import { UserQuizAnswersService } from "./service"

const service = () => new UserQuizAnswersService(UserQuizAnswers)

export default service