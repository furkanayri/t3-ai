import { Model } from "mongoose";
import { AiPrompt } from "@/types/entities";

import { BaseService } from "@/utils";

export class AiEvaluationService extends BaseService<AiPrompt> {
  constructor(model: Model<AiPrompt>) {
    super(model);
  }
}
