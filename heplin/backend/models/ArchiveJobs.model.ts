import mongoose, { Model, Types, Schema as MSchema } from "mongoose";
import { IArchiveJobs } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IArchiveJobs { }

interface IModel extends Model<IResource> { }

const modelName = "archiveJobs";

const Schema = new BaseSchema({
    title: {
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
    content: {
        type: String,
        required: true,
    },
    // requirements: {
    //   type: String,
    //   required: true,
    // },
    createdBy: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    seoTitle: {
        type: String,
        required: true,
    },
    seoDescription: {
        type: String,
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    categoryId: {
        type: Types.ObjectId,
        ref: "categories",
        required: true,
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
                required: true,
            },
            tr: {
                type: String,
                required: true,
            }
        },
    },
    city: {
        type: String,
    },
    district: {
        type: String,
    },
    fields: [
        {
            type: {
                type: String,
                //TODO: add more type enums
                enum: [
                    "name_surname",
                    "email",
                    "phone",
                    "cv",
                    "coverLetter",
                    "currentCompany",
                ],
            },
            isRequired: {
                type: Boolean,
                default: false,
            },
            isVisible: {
                type: Boolean,
                default: true,
            },
        },
    ],
    status: { //TODO: remove status
        type: String,
        enum: ["active", "closed", "archived"],
        default: "active",
    },
    viewNumber: {
        type: Number,
        default: 0
    },
    applicationNumber: {
        type: Number,
        default: 0
    },
    endDate: {
        type: Date,
    },

    // aiInterview: {
    //     type: String,
    //     enum: ['yes', 'no'],
    //     required: true
    // },
    // aiInterviewConfig: {
    //     type: Types.ObjectId,
    //     ref: "Interview",
    // },
    aiContent: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    // videoInterviewId: {
    //     type: Types.ObjectId,
    //     ref: "videoInterview",
    // },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource