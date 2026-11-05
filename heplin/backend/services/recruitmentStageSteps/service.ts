import { IRecruitmentStageStep } from "@/types/entities";
import { BaseService } from "@/utils"
import { Model } from "mongoose";

export class RecruitmentStageStepsService extends BaseService<IRecruitmentStageStep> {
    constructor(model: Model<IRecruitmentStageStep>) {
        super(model);
    }
}