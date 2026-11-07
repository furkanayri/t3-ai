import { Model } from "mongoose";
import { ICVFile } from "@/types/entities";

import { BaseService } from "@/utils"

export class CVService extends BaseService<ICVFile> {
    constructor(model: Model<ICVFile>) {
        super(model);
    }
}