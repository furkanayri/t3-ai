import { Model } from "mongoose";
import { IJobApplicationsArchives } from "@/types/entities";

import { BaseService } from "@/utils"

export class JobApplicationsArchiveService extends BaseService<IJobApplicationsArchives> {
    constructor(model: Model<IJobApplicationsArchives>) {
        super(model);
    }
}