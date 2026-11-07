import { Model } from "mongoose";

import { IInterviewQuestions } from "@/types/entities";
import InterviewQuestions from "@/models/InterviewQuestions.model";
import { BaseService } from "@/utils"

class InterviewQuestionsService extends BaseService<IInterviewQuestions> {
    constructor(model: Model<IInterviewQuestions>) {
        super(model);
    }
}

const service = () => new InterviewQuestionsService(InterviewQuestions)

export default service