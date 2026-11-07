import { Model } from "mongoose";

import { IInterviewAnswers } from "@/types/entities";
import AiInterviewAnswers from "@/models/InterviewAnswers.model";
import { BaseService } from "@/utils"

class AiInterviewAnswersService extends BaseService<IInterviewAnswers> {
    constructor(model: Model<IInterviewAnswers>) {
        super(model);
    }
}

const service = () => new AiInterviewAnswersService(AiInterviewAnswers)

export default service