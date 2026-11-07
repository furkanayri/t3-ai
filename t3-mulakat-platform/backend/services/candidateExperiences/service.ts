import { Model } from "mongoose";
import { ICandidateExperience } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidateExperiencesService extends BaseService<ICandidateExperience> {
    constructor(model: Model<ICandidateExperience>) {
        super(model);
    }
}