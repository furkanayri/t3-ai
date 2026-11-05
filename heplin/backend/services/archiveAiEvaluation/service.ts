import { Model } from "mongoose";
import { ArchiveAiPrompt } from "@/types/entities";
import { BaseService } from "@/utils";

export class ArchiveAiEvaluationService extends BaseService<ArchiveAiPrompt> {
  constructor(model: Model<ArchiveAiPrompt>) {
    super(model);
  }
}
