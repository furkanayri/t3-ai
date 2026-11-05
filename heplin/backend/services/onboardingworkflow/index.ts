import Onboardingworkflow from "@/models/Onboardingworkflows.model"
import { OnboardingworkflowsService } from "./service"

const service = () => new OnboardingworkflowsService(Onboardingworkflow)

export default service