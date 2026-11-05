import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IUser } from "@/types/entities";

export class UsersService extends BaseService<IUser> {
    constructor(Model: Model<IUser>) {
        super(Model);
    }
}