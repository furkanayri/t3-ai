import mongoose, { Model, Types } from "mongoose";
import { ITenant } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ITenant { }

interface IModel extends Model<IResource> { }

const modelName = "tenants";

const Schema = new BaseSchema({
    name: {
        type: String,
        required: true,
    },
    legalName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    website: {
        type: String,
    },
    address: {
        type: String,
    },
    subdomain: {
        type: String,
        required: true,
        unique: true,
    },
    customDomain: {
        type: String,
    },
    logo: {
        type: String,
    },
    description: {
        type: String,
    },
    parentTenantId: {
        type: Types.ObjectId,
        ref: 'tenants',
        default: null
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    contacts: [
        {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
            },
            phone: {
                type: String
            }
        }
    ],
    plan: {
        type: String,
        enum: ['basic', 'pro', 'enterprise'],
        default: 'basic'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'
    },
    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        default: '1-10'
    },
    usageQuotes: [
        {
            type: {
                type: String,
                enum: ["sms", "email"]
            },
            remainingFreeCredit: {
                credit: {
                    type: Number,
                    default: 0
                },
                expires: {
                    type: Date,
                }
            },
            remainingPurchasedCredit: {
                credit: {
                    type: Number,
                    default: 0
                },
                expires: {
                    type: Date,
                }
            },
            remainingTotalCredit: {
                credit: {
                    type: Number,
                }
            }
        }
    ],
    senderMailAddress: {
        type: String,
    },
    blacklistedCandidates: [
        {
            type: Types.ObjectId,
            ref: "candidates",
            required: false,
        },
    ],
    tenantColor: {
        type: String,
        required: false
    },
    tenantQr: {
        type: String,
        required: false
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource