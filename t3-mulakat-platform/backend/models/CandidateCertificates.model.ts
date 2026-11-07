import mongoose, { Model, Types } from "mongoose";
import { ICandidateCertificate, } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateCertificate { }

interface IModel extends Model<IResource> { }

const modelName = "candidateCertificates";

const Schema = new BaseSchema({

    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    institution: {
        type: String,
        // required: true,
    },
    degree: {
        type: String,
        // required: true,

    },
    startDate: {
        type: Date,
        required: false,
    },
    endDate: {
        type: Date,
        required: false,

    },
    files: [
        {
            fileKey: {
                type: String,
                required: true,
            },
            fileName: {
                type: String,
                default: "Untitled Certificate"
            },
            uploadDate: {
                type: Date,
            }
        }
    ]

})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource