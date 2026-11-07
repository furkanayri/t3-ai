import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { ITenant } from "@/types/entities";

export class TenantsService extends BaseService<ITenant> {
    constructor(Model: Model<ITenant>) {
        super(Model);
    }
}