import { Model } from "mongoose";
import { IJobApplication } from "@/types/entities";

import { BaseService } from "@/utils"

export class JobApplicationsService extends BaseService<IJobApplication> {
    constructor(model: Model<IJobApplication>) {
        super(model);
    }
}