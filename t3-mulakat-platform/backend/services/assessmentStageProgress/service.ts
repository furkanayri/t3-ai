import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IAssessmentStageProgress } from "@/types/entities";

export class AssessmentStageProgressService extends BaseService<IAssessmentStageProgress> {
    constructor(model: Model<IAssessmentStageProgress>) {
        super(model);
    }
}
