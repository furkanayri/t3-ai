import Notifications from "@/models/Notifications.model"
import { NotificationServices } from "./service"

const service = () => new NotificationServices(Notifications)

export default service