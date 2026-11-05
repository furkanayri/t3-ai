import mongoose, { Model, Types } from "mongoose";
import { BaseSchema } from "../utils/BaseSchema";
import { IOnboardingworkflow } from "../types/entities";

interface IResource extends IOnboardingworkflow { }

interface IModel extends Model<IResource> { }

const modelName = "onboardingworkflows";

const Schema = new BaseSchema({
    title: { type: String, required: true },
    description: { type: String, },
    items: [
        {
            type: {
                type: String,
                required: true,
                enum: ["text", "file",]
            },
            title: { type: String, required: true },
            description: { type: String, },
        }
    ],
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource