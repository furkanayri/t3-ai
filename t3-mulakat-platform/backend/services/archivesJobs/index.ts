import ArchiveJobs from "@/models/ArchiveJobs.model"
import { ArchiveJobsService } from "./service"

const service = () => new ArchiveJobsService(ArchiveJobs)

export default service