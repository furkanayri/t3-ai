import CandidateSkills from "@/models/CandidateSkills.model"
import { CandidateSkillsService } from "./service"

const service = () => new CandidateSkillsService(CandidateSkills)

export default service