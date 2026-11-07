import TenantUsageQuoteLogs from "@/models/TenantUsageQuoteLogs.model"
import { TenantUsageQuoteLogsService } from "./service"

const service = () => new TenantUsageQuoteLogsService(TenantUsageQuoteLogs)

export default service