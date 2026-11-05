import DisqualifyEmailTemplate from "@/models/DisqualifyEmailTemplates.model"
import { DisqualifyEmailTemplateService } from "./service"


const service = () => new DisqualifyEmailTemplateService(DisqualifyEmailTemplate)

export default service