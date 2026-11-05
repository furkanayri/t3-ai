import mongoose, { Model, Types } from "mongoose";
import type { IEmployee } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IEmployee { }

interface IModel extends Model<IResource> { }

const modelName = "employees";

const Schema = new BaseSchema({
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    address: {
        type: String,
    },
    userId: {
        type: Types.ObjectId,
        required: true
    },
    tenantId: {
        type: Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        default: 'employee',
        enum: ['employee', 'manager',"owner",'staff']
    },
    isOnboardCompleted: {
        type: Boolean,
        default: false
    },
    onboardingWorkflowId: {
        type: Types.ObjectId,
        ref: "onboardingworkflows",
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource
