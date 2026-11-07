import mongoose, { Model, Types } from "mongoose";
import { ICVFile } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICVFile { }

interface IModel extends Model<IResource> { }

const modelName = "cv";

const Schema = new BaseSchema({
    title: { type: String, default: "Untitled" }, // for candidate
    fileName: { type: String, required: true },
    fileKey: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: Types.ObjectId,
        ref: "users",
    },
    userId: {
        type: Types.ObjectId,
        ref: "users",
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
    size: {
        type: Number,
    },
    contentType: {
        type: String,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource