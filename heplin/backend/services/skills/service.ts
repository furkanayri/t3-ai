import { ISkill } from "@/types/entities";
import { BaseService } from "@/utils"
import { Model } from "mongoose";

export class SkillsService extends BaseService<ISkill> {
    constructor(model: Model<ISkill>) {
        super(model);
    }
}