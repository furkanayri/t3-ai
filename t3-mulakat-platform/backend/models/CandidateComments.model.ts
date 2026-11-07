import mongoose, { Model, Types } from "mongoose";
import { ICandidateComment } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateComment { }

interface IModel extends Model<IResource> { }

const modelName = "candidateComments";

const Schema = new BaseSchema({
    content: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "users", required: true },
    candidateId: { type: Types.ObjectId, ref: "candidates", required: true },
    replyId: { type: Types.ObjectId, ref: "candidateComments" },
    tenantId: { type: Types.ObjectId, ref: "tenants", required: true },
    replyCount: {
        type: Number,
        default: 0,
    },
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource