import { Model } from "mongoose";

import { IJobApplicationWithWhatsapp } from "@/types/entities";
import jobApplicationsWithWhatsapp from "@/models/jobApplicationsWithWhatsapp.model";
import { BaseService } from "@/utils"

class jobApplicationsWithWhatsappService extends BaseService<IJobApplicationWithWhatsapp> {
    constructor(model: Model<IJobApplicationWithWhatsapp>) {
        super(model);
    }
}

const service = () => new jobApplicationsWithWhatsappService(jobApplicationsWithWhatsapp)

export default service