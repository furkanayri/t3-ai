import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IAssessmentStage } from "@/types/entities";

export class AssessmentStageService extends BaseService<IAssessmentStage> {
    constructor(model: Model<IAssessmentStage>) {
        super(model);
    }
}
