import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IAccessToken } from "@/types/entities";

export class AccessTokensService extends BaseService<IAccessToken> {
    constructor(Model: Model<IAccessToken>) {
        super(Model);
    }
}