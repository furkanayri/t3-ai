import Permission from "@/models/Permissions.model"
import { PermissionsService } from "./service"

const service = () => new PermissionsService(Permission)

export default service