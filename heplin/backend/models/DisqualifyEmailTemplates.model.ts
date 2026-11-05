import mongoose, { Model, Types } from "mongoose";
import type { IDisqualifyEmailTemplate } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IDisqualifyEmailTemplate { }

interface IModel extends Model<IResource> { }

const modelName = "disqualifyemailtemplates";

const Schema = new BaseSchema({
  
    description: {
        type: String,
    },
    tenantId: {
        type: Types.ObjectId,
        required: true
    },

})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource
