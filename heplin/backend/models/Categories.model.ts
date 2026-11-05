import mongoose, { Model, Types } from "mongoose";
import { ICategories } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICategories { }

interface IModel extends Model<IResource> { }

const modelName = "categories";

const Schema = new BaseSchema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ["active", "pending"],
        default: "active",
    },
    tenantId: { type: Types.ObjectId, ref: "tenants", default: null },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource