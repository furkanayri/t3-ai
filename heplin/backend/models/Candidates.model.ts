import mongoose, { Model, Types } from "mongoose";
import { ICandidate } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";
import { on } from "koa";

interface IResource extends ICandidate { }

interface IModel extends Model<IResource> { }

const modelName = "candidates";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true, //TODO: remove here
    },
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    email: {
        type: String,
    },
    skills: [
        {
            type: Types.ObjectId,
            ref: "skills",
            required: true,
        },
    ],
    languageSkills: [
        {
            langCode: {
                type: String,
                required: true,
            },
            level: {
                type: String,
                required: true,
                values: [
                    "elementary",
                    "limitedWorking",
                    "professional",
                    "fullProfessional",
                    "native",
                ],
            },
        },
    ],
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource