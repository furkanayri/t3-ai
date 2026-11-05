import CandidateBlackLists from "@/models/CandidatesBlackLists.model"
import { CandidateBlackListsService } from "./service"

const service = () => new CandidateBlackListsService(CandidateBlackLists)

export default service