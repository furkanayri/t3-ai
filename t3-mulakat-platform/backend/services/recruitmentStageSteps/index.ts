import RecruitmentStageStep from "@/models/RecruitmentStageSteps.model"
import { RecruitmentStageStepsService } from "./service"

const service = () => new RecruitmentStageStepsService(RecruitmentStageStep)

export default service