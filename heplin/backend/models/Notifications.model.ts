import mongoose, { Model, Schema as Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";
import { INotification } from "@/types/entities";

interface IResource extends INotification { }

interface IModel extends Model<IResource> { }

const modelName = "notifications";

const Schema = new BaseSchema({

    UserId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    title: {
        type: String
    },
    content: {
        type: String,
    },
    link: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false
    },
    buttonLabel: {
        type: String
    }

});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
