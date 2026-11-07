import { Model } from "mongoose";
import { BaseService } from "@/utils";
import PersonalityTestAnswer from "@/models/PersonalityTestAnswer.model";

class PersonalityTestAnswerService extends BaseService<any> {
    constructor(model: Model<any>) {
        super(model);
    }
}

const service = () => new PersonalityTestAnswerService(PersonalityTestAnswer);

export default service;
