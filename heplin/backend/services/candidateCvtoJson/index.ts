import CandidateCv from "@/models/CandidateCvtoJson.model"
import { CandidateCvToJson } from "./service"

const service = () => new CandidateCvToJson(CandidateCv)

export default service