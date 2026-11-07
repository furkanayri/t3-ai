import OnboardingResponse from "@/models/OnboardingResponses.model"
import { OnboardingResponsesService } from "./service"

const service = () => new OnboardingResponsesService(OnboardingResponse)

export default service