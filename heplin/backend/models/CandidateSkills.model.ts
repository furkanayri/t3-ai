import mongoose, { Model, Types } from "mongoose";
import { ICandidateSkill } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateSkill { }

interface IModel extends Model<IResource> { }

const modelName = "candidateSkills";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    skills: [{
        type: Types.ObjectId,
        ref: "skills",
        required: true,
    }]
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource