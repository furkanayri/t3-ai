import CandidateArchives from "@/models/CandidateArchives.model"
import { CandidateArchivesService } from "./service"

const service = () => new CandidateArchivesService(CandidateArchives)

export default service