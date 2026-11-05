import { Model } from "mongoose";
import { BaseService } from "@/utils"
import { IOnboardingResponse } from "@/types/entities";


export class OnboardingResponsesService extends BaseService<IOnboardingResponse> {
    constructor(model: Model<IOnboardingResponse>) {
        super(model);
    }
}