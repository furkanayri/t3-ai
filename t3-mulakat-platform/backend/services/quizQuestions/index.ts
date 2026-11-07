import QuizQuestions from "@/models/QuizQuestions.model"
import { QuizQuestionsService } from "./service"

const service = () => new QuizQuestionsService(QuizQuestions)

export default service