import { IJob } from "@/types/entities";
import { BaseService } from "@/utils"
import { Model } from "mongoose";


export class JobsService extends BaseService<IJob> {
    constructor(model: Model<IJob>) {
        super(model);
    }
}