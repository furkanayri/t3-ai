import mongoose, { Model, Types, SchemaTypes } from "mongoose";
import { IJobApplication } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends IJobApplication { }

interface IModel extends Model<IResource> { }

const modelName = "jobApplications";

const Schema = new BaseSchema({
  candidateId: {
    type: Types.ObjectId,
    ref: "candidates",
    required: true,
  },
  userId: {
    type: Types.ObjectId,
    ref: "users",
    required: true,
  },
  viewedBy: [
    {
      employeeId: {
        type: Types.ObjectId,
        ref: 'employees',
        required: true,
      },
      star: {
        type: Boolean,
        default: false,
      },
      isSeen: {
        type: Boolean,
        default: false,
      },
    }
  ],
  employeeId: {
    type: Types.ObjectId,
    ref: "employees",
  },
  cv: {
    type: Types.ObjectId,
    ref: "cv",
    required: true,
  },
  coverLetter: {
    type: String,
  },
  currentRecruitmentStepId: {
    type: Types.ObjectId,
    ref: "recruitmentStageSteps",
    required: true,
  },
  applicantAnswers: [
    {
      questionId: {
        type: Types.ObjectId,
        // required: true,
      },
      answer: {
        type: SchemaTypes.Mixed,
      },
      isMatching: {
        type: Boolean,
      },
    },
  ],
  matchingScore: {
    type: Number,
    default: 0,
  },
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
  note: {
    type: String, //Candidate note
  },
  hrNote: {
    type: String, //HR Personal Note
  },
  disqualifyReason: {
    type: String,
  },
  disqualifyTimestamp: {
    type: Date,
  },

  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  onboardingId: {
    type: Types.ObjectId,
    ref: "candidateonboardings",
  },
  status: {
    type: String,
    enum: [
      "applied",
      "onBoarding",
      "hired",
      "cancelledByCandidate",
      "disqualified",
    ],
    default: "applied"
  },
  isAppliedViaWhatsapp: {
    type: Boolean,
    default: false
  },
  candidateScore: {
    type: Number,
    default: 0,
  },
  isAppliedViaTelegram: {
    type: Boolean,
    default: false
  },
});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;