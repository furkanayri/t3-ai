import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IRecruitmentStage } from "@/types/entities";

export class RecruitmentStagesService extends BaseService<IRecruitmentStage> {
    constructor(model: Model<IRecruitmentStage>) {
        super(model);
    }
}