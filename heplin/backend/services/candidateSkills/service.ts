import { Model } from "mongoose";
import { ICandidateSkill } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidateSkillsService extends BaseService<ICandidateSkill> {
    constructor(model: Model<ICandidateSkill>) {
        super(model);
    }
}