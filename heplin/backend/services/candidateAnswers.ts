import { Model } from "mongoose";

import { ICandidateEvaluation, ICandidateAnswers } from "@/types/entities";
import CandidateAnswers from "@/models/CandidateAnswers.model";

import { BaseService } from "@/utils"

class CandidateInterviewAnswersService extends BaseService<ICandidateAnswers> {
    constructor(model: Model<ICandidateAnswers>) {
        super(model);
    }
}

const service = () => new CandidateInterviewAnswersService(CandidateAnswers)

export default service