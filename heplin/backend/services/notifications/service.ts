import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { INotification } from "@/types/entities";

export class NotificationServices extends BaseService<INotification> {
    constructor(Model: Model<INotification>) {
        super(Model);
    }
}
