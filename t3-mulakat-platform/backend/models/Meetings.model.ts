import mongoose, { Model, Types } from "mongoose";
import { IMeeting } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IMeeting { }

interface IModel extends Model<IResource> { }

const modelName = "meetings";

const Schema = new BaseSchema({
    candidateId: {
        type: Types.ObjectId,
        ref: "candidates",
    },
    attendees: [{
        employeeId: {
            type: Types.ObjectId,
            ref: "employees",
            required: true,
        },
        attendeeUrl: {
            type: String,
            required: false,
        }
    }],
    jobId: {
        type: Types.ObjectId,
        ref: "jobs",
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: "tenants",
        required: true,
    },
    recruitmentStageStepId: {
        type: Types.ObjectId,
        ref: "recruitmentStageSteps",
        required: true,
    },
    hostId: {
        type: Types.ObjectId,
        ref: "employees",
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["online", "onsite", "phone"],
    },
    notes: {
        type: String,
    },
    privateNotes: {
        type: String
    },
    date: {
        type: Date,
        required: true,
    },
    timezone: {
        type: String,
        default: "UTC"
    },
    status: {
        type: String,
        enum: ["initial", "cancelled", "completed"],
        default: "initial",
    },
    adminUrl: {
        type: String,
    },
    candicateUrl: {
        type: String,
    },
    title: {
        type: String,
    },
    zoomMeetingId: {
        type: String
    }
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource
