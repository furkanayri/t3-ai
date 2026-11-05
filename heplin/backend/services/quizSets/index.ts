import QuizSets from "@/models/QuizSets.model"
import { QuizSetsService } from "./service"

const service = () => new QuizSetsService(QuizSets)

export default service