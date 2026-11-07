import mongoose, { Model, Types } from "mongoose";
import type { IEmailTemplate, IEmployee } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IEmailTemplate { }

interface IModel extends Model<IResource> { }

const modelName = "emailtemplates";

const Schema = new BaseSchema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    message: {
        type: String,
    },
    subject: {
        type: String,
    },
    tenantId: {
        type: Types.ObjectId,
        required: true
    },

})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource
