import { Model } from "mongoose";
import { ICandidateCertificate, } from "@/types/entities";

import { BaseService } from "@/utils"

export class CandidateCertificatesService extends BaseService<ICandidateCertificate> {
    constructor(model: Model<ICandidateCertificate>) {
        super(model);
    }
}