import { Model } from "mongoose";

import { ICandidateEvaluation } from "@/types/entities";
import CandidateEvaluations from "@/models/CandidateEvaluations.model";
import { BaseService } from "@/utils"

class CandidateEvaluationsService extends BaseService<ICandidateEvaluation> {
    constructor(model: Model<ICandidateEvaluation>) {
        super(model);
    }
}

const service = () => new CandidateEvaluationsService(CandidateEvaluations)

export default service