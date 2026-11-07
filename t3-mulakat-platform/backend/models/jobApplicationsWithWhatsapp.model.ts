import mongoose, { Model, Types, SchemaTypes } from "mongoose";
import { IJobApplicationWithWhatsapp } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IJobApplicationWithWhatsapp { }

interface IModel extends Model<IResource> { }

const modelName = "jobApplicationsWithWhatsapp";

const Schema = new BaseSchema({
  userId: {
    type: Types.ObjectId,
    ref: "users",
  },
  phone: {
    type: String,
    required: true,
  },
  selectedTenantId: {
    type: Types.ObjectId,
    ref: "tenants",
  },
  selectedJobId: {
    type: Types.ObjectId,
    ref: "jobs",
  }

});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
