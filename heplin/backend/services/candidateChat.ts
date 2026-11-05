import { Model } from "mongoose";

import { ICandidateChat } from "@/types/entities";
import CandidateChat from "@/models/CandidateChat.model";
import { BaseService } from "@/utils"

class CadndidateChatService extends BaseService<ICandidateChat> {
    constructor(model: Model<ICandidateChat>) {
        super(model);
    }
}

const service = () => new CadndidateChatService(CandidateChat)

export default service