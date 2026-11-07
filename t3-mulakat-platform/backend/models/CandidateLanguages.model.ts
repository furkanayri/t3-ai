import mongoose, { Model, Types } from "mongoose";
import { ICandidateLanguage } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateLanguage { }

interface IModel extends Model<IResource> { }

const modelName = "candidateLanguages";

const Schema = new BaseSchema({
    candidateId: { type: Types.ObjectId, ref: "candidates", required: false },
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    name: {
        type: String,
        required: true,
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
})
const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource