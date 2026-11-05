import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";
import { IMail } from "../types/entities";

interface IResource extends IMail { }

interface IModel extends Model<IResource> { }

const modelName = "mails";

const Schema = new BaseSchema({
    parsedFromS3Key: {
        type: String,
    },
    parsedDate: {
        type: Date,
    },
    date: {
        type: Date,
    },
    from: {
        name: {
            type: String,
        },
        address: {
            type: String,
        },
        text: {
            type: String,
        }
    },
    to: [{
        name: {
            type: String,
        },
        address: {
            type: String,
        },
        text: {
            type: String,
        }
    }
    ],
    cc: [
        {
            name: {
                type: String,
            },
            address: {
                type: String,
            },
        }
    ],
    subject: {
        type: String,
    },
    text: {
        type: String,
    },
    html: {
        type: String,
    },
    attachments: [{
        filename: String,
        filekey: String,
        size: Number,
    }],
    isSeen: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    threadId: {
        type: String,
        required: true
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource