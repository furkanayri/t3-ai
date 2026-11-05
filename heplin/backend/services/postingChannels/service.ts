import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IPostingChannel } from "@/types/entities";

export class PostingChannelsService extends BaseService<IPostingChannel> {
    constructor(Model: Model<IPostingChannel>) {
        super(Model);
    }
}