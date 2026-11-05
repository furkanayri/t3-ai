import { Model } from "mongoose";
import { ICV } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidateCvToJson extends BaseService<ICV> {
    constructor(model: Model<ICV>) {
        super(model);
    }
}