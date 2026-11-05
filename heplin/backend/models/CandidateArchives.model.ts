import mongoose, { Model } from "mongoose";
import type { ICandidateArchive } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";
import { redisPublisher } from "@/utils";
import { is } from "bluebird";

interface IResource extends ICandidateArchive { }

interface IModel extends Model<IResource> { }

const modelName = "candidateArchives";

const Schema = new BaseSchema({
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    address: {
        type: String,
    },
    district: {
        type: Number,
    },
    province: {
        type: Number,
    },
    preferredLanguage: {
        type: String,
        default: "tr",
    },
    avatar: {
        type: String,
    },
    status: {
        type: String,
        enum: ["active", "pending", "passive", "frozen", "deleted"],
        default: "pending",
    },
    lastLogin: {
        type: Date,
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
    recoveryCode: {
        type: String,
        default: null,
    },
    registrationToken: {
        type: String,
        default: null,
    },
    registrationTokenExpires: {
        type: Date,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isAcceptedTOS: {
        type: Boolean,
        default: false,
    },
    isAcceptedKVKK: {
        type: Boolean,
        default: false,
    },
    lastSmsSent: {
        type: Date,
    },
    maritalStatus: {
        type: String,
        enum: ["married", "single"],
    },
    militaryStatus: {
        type: String,
        enum: ["completed", "exempt", "incomplete"],
    },
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    identificationNumber: {
        type: String,
    },
    isTenantMember: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    isPersonaltyTest: {
        type: Boolean,
        default: false,
    },
    coverLetter: {
        type: String,
    },
    languages: [
        {
            name: {
                type: String,
                required: false,
            },
            languageLevel: {
                type: String,
                // required: true,
                enum: [
                    "beginner",
                    "pre-intermediate",
                    "intermediate",
                    "upper-intermediate",
                    "advanced",
                    "proficiency",
                ],
            },
        },
    ],
    skills: [
        {
            name: {
                type: String,
                required: false,
            },
            slug: {
                type: String,
                required: false,
            },
        },
    ],
    experience: [
        {
            title: {
                type: String,
                required: false,
            },
            description: {
                type: String,
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
                required: false,
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
            startDate: {
                type: String

            },
            endDate: {
                type: String
            },
        },
    ],
    education: [
        {
            institution: {
                type: String,
                required: false,
            },
            degree: {
                type: String,
            },
            major: {
                type: String,
            },
            startDate: {
                type: String,
                required: false,
            },
            endDate: {
                type: String
            },
            isOngoing: {
                type: Boolean,
                default: false,
            },
            isActive: {
                type: Boolean,
                default: true,
            },
        },
    ],
    certificates: [
        {
            institution: {
                type: String,
                required: false,
            },
            degree: {
                type: String,
                required: false,

            },
            startDate: {
                type: String,
                required: false,
            },
            endDate: {
                type: String,
                required: false,

            },
        },
    ],
    reference: [
        {
            name: String,
            relationship: String,
            phone: String,
        },
    ],
});


Schema.post("save", (doc) => {
    redisPublisher.publish(
        "documentSaved",
        JSON.stringify({
            modelName,
            document: doc.toJSON(),
        })
    );
});



const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
