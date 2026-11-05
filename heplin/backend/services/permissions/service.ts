import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IPermission } from "@/types/entities";

export class PermissionsService extends BaseService<IPermission> {
    constructor(Model: Model<IPermission>) {
        super(Model);
    }
}
