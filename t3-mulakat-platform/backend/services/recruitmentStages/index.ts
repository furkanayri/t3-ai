import RecruitmentStage from "@/models/RecruitmentStages.model"
import { RecruitmentStagesService } from "./service"

const service = () => new RecruitmentStagesService(RecruitmentStage)

export default service