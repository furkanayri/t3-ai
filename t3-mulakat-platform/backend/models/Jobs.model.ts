import mongoose, { Model, Types, Schema as MSchema } from "mongoose";
import { IJob } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IJob { }

interface IModel extends Model<IResource> { }

const modelName = "jobs";

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
    hiringTeams: [
        {
            type: Types.ObjectId,
            ref: "employees",
            required: true,
        },
    ],
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
    recruitmentStageId: {
        type: Types.ObjectId,
        ref: "recruitmentStages",
        required: true,
    },
    applicantForm: [
        {
            type: {
                type: String,
                enum: [
                    "text",
                    "multiline",
                    "number",
                    // "video-answer",TODO: implement next version
                    "trueFalse",
                    "choice",
                    "multiple-choices",
                    "price",
                ],
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
            },
            options: {
                isRequired: {
                    type: Boolean,
                    required: true,
                },
                items: [
                    {
                        type: String,
                    },
                ],
                currency: {
                    type: String,
                },
                expectedAnswer: {
                    type: MSchema.Types.Mixed,
                },
            },
        },
    ],
    skills: [
        {
            type: Types.ObjectId,
            ref: "skills",
            required: true,
        },
    ],
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
    publishedChannels: [{
        channelId: {
            type: Types.ObjectId,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "published", "declined", "draft", "closed", "pendingClosure"]
        },
        lastPublishedAt: {
            type: Date,
        }
    }],
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