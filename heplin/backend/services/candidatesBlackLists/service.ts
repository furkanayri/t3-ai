import { Model } from "mongoose";
import { ICandidateBlackList } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidateBlackListsService extends BaseService<ICandidateBlackList> {
    constructor(model: Model<ICandidateBlackList>) {
        super(model);
    }
}