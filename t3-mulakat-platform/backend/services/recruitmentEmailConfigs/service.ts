import { IRecruitmentEmailConfig } from "@/types/entities";
import { BaseService } from "@/utils"
import { Model } from "mongoose";

export class RecruitmentEmailConfigsService extends BaseService<IRecruitmentEmailConfig> {
    constructor(model: Model<IRecruitmentEmailConfig>) {
        super(model);
    }
}