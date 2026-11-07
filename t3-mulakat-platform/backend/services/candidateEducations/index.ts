import CandidateEducations from "@/models/CandidateEducations.model"
import { CandidateEducationsService } from "./service"

const service = () => new CandidateEducationsService(CandidateEducations)

export default service