import RecruitmentEmailConfig from "@/models/RecruitmentEmailConfigs.model"
import { RecruitmentEmailConfigsService } from "./service"

const service = () => new RecruitmentEmailConfigsService(RecruitmentEmailConfig)

export default service