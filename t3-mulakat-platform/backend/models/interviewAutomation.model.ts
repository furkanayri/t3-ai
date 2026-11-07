import mongoose, { Model, Types } from "mongoose";
import { IInterviewAutomation, } from "../types/entities";//
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IInterviewAutomation { }//

interface IModel extends Model<IResource> { }

const modelName = "interviewautomation";

const Schema = new BaseSchema({
    name: {
        type: String,
        required: true
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    interviewList: [
        {
            type: Types.ObjectId,
            ref: "interview",
            required: true,
        }
    ]
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource