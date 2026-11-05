import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IConfig } from "@/types/entities";

export class ConfigsService extends BaseService<IConfig> {
    constructor(Model: Model<IConfig>) {
        super(Model);
    }
}