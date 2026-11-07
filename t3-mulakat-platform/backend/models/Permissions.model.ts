import mongoose, { Model, Schema as MongooseSchema, Types } from "mongoose";
import { IPermission } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IPermission { }

interface IModel extends Model<IResource> { }

const modelName = "permissions";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    scope: {
        type: String,
        required: true,
    },
    resource: {
        type: MongooseSchema.Types.Mixed,
        required: true,
    },
    allowed: {
        type: Boolean,
        default: true,
    },
    // applications: [
    //     {
    //         type: String,
    //         enum: ["hitatek.applin.ik", "hitatek.applin.mesai"],
    //         required: true,
    //     },
    // ],
});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
