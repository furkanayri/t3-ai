import mongoose, { Model, Types } from "mongoose";
import { ISkill } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ISkill { }

interface IModel extends Model<IResource> { }

const modelName = "skills";

const Schema = new BaseSchema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource