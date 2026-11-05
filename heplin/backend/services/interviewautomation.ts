import { Model } from "mongoose";

import { IInterviewAnswers, IInterviewAutomation } from "@/types/entities";
import InterviewAutomation from "@/models/interviewAutomation.model";
import { BaseService } from "@/utils"

class InterviewAutomationService extends BaseService<IInterviewAutomation> {
    constructor(model: Model<IInterviewAutomation>) {
        super(model);
    }
}

const service = () => new InterviewAutomationService(InterviewAutomation)

export default service