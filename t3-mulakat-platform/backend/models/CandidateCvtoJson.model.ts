import mongoose, { Model, Types } from "mongoose";
import { ICV } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICV { }

interface IModel extends Model<IResource> { }

const modelName = "candidateCvtoJson";

const Schema = new BaseSchema({
  userId: {
    type: Types.ObjectId,
    ref: "users",
    required: true,
  },
  cvId: {
    type: Types.ObjectId,
    ref: "cvs",
    required: true,
  },
  experience: [
    {
      title: { type: String, required: true },
      description: { type: String },
      isOngoing: { type: Boolean },
      company: { type: String },
      position: { type: String },
      jobType: { type: String, enum: ["fulltime", "parttime", "contract", "temporary", "voluntarily", "intern", "other"] },
      country: {
        names: {
          en: {
            type: String,
          },
          tr: {
            type: String,
          }
        },
      },
      startDate: { type: Date },
      endDate: { type: Date },
      city: { type: String },
      district: { type: String },
      locationType: { type: String, enum: ["onsite", "hybrid", "remote"] },
      isActive: { type: Boolean },
    },
  ],
  education: [
    {
      institution: { type: String, required: true },
      degree: { type: String },
      major: { type: String },
      isOngoing: { type: Boolean },
      startDate: { type: Date },
      endDate: { type: Date },
      isActive: { type: Boolean },
      description: { type: String },
    },
  ],
  certificates: [
    {
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      startDate: { type: Date },
      endDate: { type: Date },
    },
  ],
  languages: [
    {
      name: { type: String, required: true },
      languageLevel: {
        type: String,
        enum: [
          "beginner",
          "pre-intermediate",
          "intermediate",
          "upper-intermediate",
          "advanced",
          "proficiency",
        ],
      },
    },
  ],
  skills: [
    {
      name: { type: String },
      slug: { type: String },
    },
  ],
  coverLetter: { type: String },
  contactInformation: {
    name: { type: String },
    surname: { type: String },
    email: { type: String },
    address: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    phoneNumber: { type: String },
    birthDay: { type: String },
  },
  reference: [
    {
      name: { type: String },
      description: { type: String },
      contact: [
        {
          email: { type: String },
          phoneNumber: { type: String },
        },
      ],
    },
  ],
});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource