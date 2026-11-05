import { IMeeting } from "@/types/entities";
import { BaseService } from "@/utils"
import { Model } from "mongoose";


export class MeetingsService extends BaseService<IMeeting> {
    constructor(model: Model<IMeeting>) {
        super(model);
    }
}