import Candidate from "@/models/Candidates.model"
import { CandidatesService } from "./service"

const service = () => new CandidatesService(Candidate)

export default service