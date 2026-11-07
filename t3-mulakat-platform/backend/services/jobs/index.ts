import Job from "@/models/Jobs.model"
import { JobsService } from "./service"

const service = () => new JobsService(Job)

export default service