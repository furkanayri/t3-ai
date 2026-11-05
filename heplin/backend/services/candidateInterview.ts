import { Model } from "mongoose";

import { ICandidateEvaluation, ICandidateInterview } from "@/types/entities";
import CandidateInterview from "@/models/CandidateInterview.model";
import { BaseService } from "@/utils"

class CandidateInterviewService extends BaseService<ICandidateInterview> {
    constructor(model: Model<ICandidateInterview>) {
        super(model);
    }
}

const service = () => new CandidateInterviewService(CandidateInterview)

export default service