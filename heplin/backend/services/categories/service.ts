import { Model } from "mongoose";
import { ICategories } from "@/types/entities";

import { BaseService } from "@/utils"

export class CategoryService extends BaseService<ICategories> {
    constructor(model: Model<ICategories>) {
        super(model);
    }
}