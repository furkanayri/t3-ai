import { Model } from "mongoose";
import { ICandidate } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidatesService extends BaseService<ICandidate> {
    constructor(model: Model<ICandidate>) {
        super(model);
    }
}