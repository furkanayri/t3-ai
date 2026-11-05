import mongoose, { Model, Types } from "mongoose";
import { ICandidateExperience } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateExperience { }

interface IModel extends Model<IResource> { }

const modelName = "candidateExperiences";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        // required: true,
    },
    title: {
        type: String,
        // required: true,
    },
    description: {
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
    company: {
        type: String,
    },
    position: {
        type: String,
    },
    jobType: {
        type: String,
        enum: [
            "fulltime",
            "parttime",
            "contract",
            "temporary",
            "voluntarily",
            "intern",
            "other",
        ],
    },
    locationType: {
        type: String,
        enum: ["onsite", "hybrid", "remote"],
        required: true,
    },
    country: {
        names: {
            en: {
                type: String,
            },
            tr: {
                type: String,
            }
        },
    },
    city: {
        type: String,
    },
    district: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource