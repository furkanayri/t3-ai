import JobApplication from "@/models/JobApplications.model"
import { JobApplicationsService } from "./service"

const service = () => new JobApplicationsService(JobApplication)

export default service