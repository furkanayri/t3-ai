import { Model } from "mongoose";

import { IEvaluationTemplate } from "@/types/entities";
import EvaluationTemplate from "@/models/EvaluationTemplates.model";
import { BaseService } from "@/utils"

class EvaluationTemplatesService extends BaseService<IEvaluationTemplate> {
    constructor(model: Model<IEvaluationTemplate>) {
        super(model);
    }
}

const service = () => new EvaluationTemplatesService(EvaluationTemplate)

export default service