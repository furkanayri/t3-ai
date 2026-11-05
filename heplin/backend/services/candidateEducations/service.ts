import { Model } from "mongoose";
import { ICandidateEducation } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidateEducationsService extends BaseService<ICandidateEducation> {
    constructor(model: Model<ICandidateEducation>) {
        super(model);
    }
}