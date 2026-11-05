import { Model } from "mongoose";
import {  IEmailTemplate } from "@/types/entities";

import { BaseService } from "@/utils"

export class EmailTemplateService extends BaseService<IEmailTemplate> {
    constructor(model: Model<IEmailTemplate>) {
        super(model);
    }
}