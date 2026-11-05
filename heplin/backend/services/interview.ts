import { Model } from "mongoose";

import { IInterview } from "@/types/entities";
import AiInterviews from "@/models/Interview.model";
import { BaseService } from "@/utils"

class AiInterviewsService extends BaseService<IInterview> {
    constructor(model: Model<IInterview>) {
        super(model);
    }
}

const service = () => new AiInterviewsService(AiInterviews)

export default service