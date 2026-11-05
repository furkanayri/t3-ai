import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { ITenantUsageQuoteLogs } from "@/types/entities";

export class TenantUsageQuoteLogsService extends BaseService<ITenantUsageQuoteLogs> {
    constructor(Model: Model<ITenantUsageQuoteLogs>) {
        super(Model);
    }
}