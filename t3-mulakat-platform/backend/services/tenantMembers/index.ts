import TenantMembers from "@/models/TenantMembers.model"
import { TenantMembersService } from "./service"

const service = () => new TenantMembersService(TenantMembers)

export default service