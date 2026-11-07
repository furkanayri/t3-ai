import mongoose, { Model, Types } from "mongoose";
import { IDepartment } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IDepartment { }

interface IModel extends Model<IResource> { }

const modelName = "departments";

const Schema = new BaseSchema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    slug: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    managers: [
        {
            type: Types.ObjectId,
            ref: "users",
            required: true,
        },
    ],
    hiringTeams: [
        {
            type: Types.ObjectId,
            ref: "users",
            required: true,
        },
    ],
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource