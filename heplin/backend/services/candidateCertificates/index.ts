import CandidateCertificates from "@/models/CandidateCertificates.model"
import { CandidateCertificatesService } from "./service"

const service = () => new CandidateCertificatesService(CandidateCertificates)

export default service