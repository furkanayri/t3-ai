import mongoose, { Model, Types } from "mongoose";
import { IInterview, } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IInterview { }

interface IModel extends Model<IResource> { }

const modelName = "interview";

const Schema = new BaseSchema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource