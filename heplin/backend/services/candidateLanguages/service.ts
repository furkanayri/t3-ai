import { Model } from "mongoose";
import { ICandidateLanguage } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidateLanguagesService extends BaseService<ICandidateLanguage> {
    constructor(model: Model<ICandidateLanguage>) {
        super(model);
    }
}