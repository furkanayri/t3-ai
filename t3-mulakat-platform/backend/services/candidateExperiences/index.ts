import CandidateExperinces from "@/models/CandidateExperiences.model"
import { CandidateExperiencesService } from "./service"

const service = () => new CandidateExperiencesService(CandidateExperinces)

export default service