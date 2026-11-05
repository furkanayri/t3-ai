import CandidateLanguages from "@/models/CandidateLanguages.model"
import { CandidateLanguagesService } from "./service"

const service = () => new CandidateLanguagesService(CandidateLanguages)

export default service