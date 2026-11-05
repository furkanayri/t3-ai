import { Model } from "mongoose";
import { IDepartment } from "@/types/entities";

import { BaseService } from "@/utils"

export class DepartmentsService extends BaseService<IDepartment> {
    constructor(model: Model<IDepartment>) {
        super(model);
    }
}