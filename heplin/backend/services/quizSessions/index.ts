import QuizSessions from "@/models/QuizSessions.model"
import { QuizSessionsService } from "./service"

const service = () => new QuizSessionsService(QuizSessions)

export default service