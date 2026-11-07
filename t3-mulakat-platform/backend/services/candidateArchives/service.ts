import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { ICandidateArchive } from "@/types/entities";

export class CandidateArchivesService extends BaseService<ICandidateArchive> {
    constructor(Model: Model<ICandidateArchive>) {
        super(Model);
    }
}