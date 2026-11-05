import mongoose, { Model, Types } from "mongoose";
import { ICandidateEducation } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateEducation { }

interface IModel extends Model<IResource> { }

const modelName = "candidateEducations";

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
    },
    major: {
        type: String,
    },
    startDate: {
        type: Date,
        required: false,
    },
    endDate: {
        type: Date,
    },
    isOngoing: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource