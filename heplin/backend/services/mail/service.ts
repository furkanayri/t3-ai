import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IMail } from "@/types/entities";


export class MailsService extends BaseService<IMail> {
    constructor(model: Model<IMail>) {
        super(model);
    }
}