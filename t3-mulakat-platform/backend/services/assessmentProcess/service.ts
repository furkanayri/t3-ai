import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IAssessmentProcess } from "@/types/entities";

export class AssessmentProcessService extends BaseService<IAssessmentProcess> {
    constructor(model: Model<IAssessmentProcess>) {
        super(model);
    }
}
