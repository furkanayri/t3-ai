import CV from "@/models/CV.model"
import { CVService } from "./service"

const service = () => new CVService(CV)

export default service