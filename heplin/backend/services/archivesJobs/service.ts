import { IArchiveJobs } from "@/types/entities";
import { BaseService } from "@/utils"
import { Model } from "mongoose";


export class ArchiveJobsService extends BaseService<IArchiveJobs> {
    constructor(model: Model<IArchiveJobs>) {
        super(model);
    }
}