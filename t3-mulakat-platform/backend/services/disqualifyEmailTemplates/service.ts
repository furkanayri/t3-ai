import { Model } from "mongoose";
import {  IDisqualifyEmailTemplate } from "@/types/entities";

import { BaseService } from "@/utils"

export class DisqualifyEmailTemplateService extends BaseService<IDisqualifyEmailTemplate> {
    constructor(model: Model<IDisqualifyEmailTemplate>) {
        super(model);
    }
}