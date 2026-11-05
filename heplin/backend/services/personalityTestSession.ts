import { Model } from "mongoose";
import { BaseService } from "@/utils";
import PersonalityTestSession from "@/models/PersonalityTestSession.model";

class PersonalityTestSessionService extends BaseService<any> {
    constructor(model: Model<any>) {
        super(model);
    }
}

const service = () => new PersonalityTestSessionService(PersonalityTestSession);

export default service;
