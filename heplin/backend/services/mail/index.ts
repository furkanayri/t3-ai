import Mail from "@/models/Mails.model"
import { MailsService } from "./service"

const service = () => new MailsService(Mail)

export default service