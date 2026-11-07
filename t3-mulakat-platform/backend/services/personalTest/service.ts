import { Model } from "mongoose";
import { IPersonalityTestResult } from "@/types/entities";

import { BaseService } from "@/utils"

export class PersonalityTestService extends BaseService<IPersonalityTestResult> {
    constructor(model: Model<IPersonalityTestResult>) {
        super(model);
    }
}