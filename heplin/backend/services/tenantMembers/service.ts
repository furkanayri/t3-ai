import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { ITenantMember } from "@/types/entities";

export class TenantMembersService extends BaseService<ITenantMember> {
    constructor(Model: Model<ITenantMember>) {
        super(Model);
    }
}