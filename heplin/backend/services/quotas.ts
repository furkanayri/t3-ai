import { Model } from "mongoose";

import { IQuotas } from "@/types/entities";
import Quota from "@/models/Quotas.model";
import { BaseService } from "@/utils"

class QuotasService extends BaseService<IQuotas> {
    constructor(model: Model<IQuotas>) {
        super(model);
    }
}

const service = () => new QuotasService(Quota)

export default service