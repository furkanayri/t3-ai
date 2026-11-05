import mongoose, { Model } from "mongoose";
import type { IAccessToken } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IAccessToken { }

interface IModel extends Model<IResource> { }

const modelName = "accessTokens";

const Schema = new BaseSchema({
    accessKeyId: {
        type: String,
        unique: true,
        required: true,
    },
    accessSecretKey: {
        type: String,
        unique: true,
        required: true,
    },
    description: String
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource
