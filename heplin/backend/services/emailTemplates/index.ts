import EmailTemplate from "@/models/EmailTemplates.model"
import { EmailTemplateService } from "./service"

const service = () => new EmailTemplateService(EmailTemplate)

export default service