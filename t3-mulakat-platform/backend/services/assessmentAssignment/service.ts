import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IAssessmentAssignment } from "@/types/entities";

export class AssessmentAssignmentService extends BaseService<IAssessmentAssignment> {
    constructor(model: Model<IAssessmentAssignment>) {
        super(model);
    }
}
