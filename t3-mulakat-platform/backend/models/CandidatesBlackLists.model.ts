import mongoose, { Model, Types } from "mongoose";
import { ICandidateBlackList } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICandidateBlackList { }

interface IModel extends Model<IResource> { }

const modelName = "candidateBlackLists";

const Schema = new BaseSchema({
    candidateId: {
        type: Types.ObjectId,
        ref: "candidates",
        required: true,
      },
      jobApplicationId: {
        type: Types.ObjectId,
        ref: "jobApplications",
        required: true,
      },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    jobId: {
        type: Types.ObjectId,
        ref: "jobs",
        required: true,
      },
    reason: {
        type: String,

 },
 isRemoveBlackList:{
      type:Boolean,
      default:false
 }

})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource