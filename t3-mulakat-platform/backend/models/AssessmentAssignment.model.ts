import mongoose, { Model, Types } from "mongoose";
import { IAssessmentAssignment } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IAssessmentAssignment { }

interface IModel extends Model<IResource> { }

const modelName = "assessmentassignments";

const Schema = new BaseSchema({
    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true,
    },
    assessmentProcessId: {
        type: Types.ObjectId,
        ref: "assessmentprocesses",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    assignedBy: {
        type: Types.ObjectId,
        ref: "users",
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['assigned', 'in-progress', 'completed', 'expired', 'cancelled'],
        default: 'assigned',
    },
})

Schema.index({ userId: 1, assessmentProcessId: 1 }, { unique: true });

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource
