import Tenant from "@/models/Tenants.model"
import { TenantsService } from "./service"

const service = () => new TenantsService(Tenant)

export default service