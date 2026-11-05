import CandidateComments from "@/models/CandidateComments.model"
import { CandidateCommentsService } from "./service"

const service = () => new CandidateCommentsService(CandidateComments)

export default service