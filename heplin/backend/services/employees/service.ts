import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IEmployee } from "@/types/entities";

export class EmployeesService extends BaseService<IEmployee> {
    constructor(Model: Model<IEmployee>) {
        super(Model);
    }
}