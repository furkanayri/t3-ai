import { Model } from "mongoose";

import { ICandidateOnboarding } from "@/types/entities";
import CandidateOnboardings from "@/models/CandidateOnboarding.model";
import { BaseService } from "@/utils"

class CandidateOnboardingsService extends BaseService<ICandidateOnboarding> {
    constructor(model: Model<ICandidateOnboarding>) {
        super(model);
    }
}

const service = () => new CandidateOnboardingsService(CandidateOnboardings)

export default service