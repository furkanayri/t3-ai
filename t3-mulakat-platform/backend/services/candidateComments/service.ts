import { Model } from "mongoose";
import { ICandidateComment } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidateCommentsService extends BaseService<ICandidateComment> {
    constructor(model: Model<ICandidateComment>) {
        super(model);
    }
}