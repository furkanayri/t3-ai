import JobApplicationArchives from "@/models/jobApplicationsArchives.model"
import { JobApplicationsArchiveService } from "./service"


const service = () => new JobApplicationsArchiveService(JobApplicationArchives)

export default service