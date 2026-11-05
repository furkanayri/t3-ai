import { PersonalityTestService } from "./service"
import PersonalityTestResult from "@/models/PersonalityTestResult.model"

const service = () => new PersonalityTestService(PersonalityTestResult)

export default service