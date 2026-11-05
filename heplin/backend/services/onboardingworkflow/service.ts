import { Document } from "mongoose";
import { BaseService } from "@/utils"

interface IOnboardingworkflow extends Document { }

export class OnboardingworkflowsService extends BaseService<IOnboardingworkflow> {
    constructor(Model) {
        super(Model);
    }
}