import mongoose, { Model } from "mongoose";
import type { IUser } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";
import { redisPublisher } from "@/utils";
import { is } from "bluebird";

interface IResource extends IUser { }

interface IModel extends Model<IResource> { }

const modelName = "users";

const Schema = new BaseSchema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  googleId: { type: String },

  facebookId: { type: String },

  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  middleName: {
    type: String,
  },
  phone1: {
    type: String,
  },
  phone2: {
    type: String,
  },
  address: {
    type: String,
  },
  district: {
    type: Number,
  },
  province: {
    type: Number,
  },
  postalCode: {
    type: String,
  },
  preferredLanguage: {
    type: String,
    default: "tr",
  },
  avatar: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "pending", "passive", "frozen", "deleted"],
    default: "pending",
  },
  lastLogin: {
    type: Date,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  recoveryCode: {
    type: String,
    default: null,
  },
  registrationToken: {
    type: String,
    default: null,
  },
  registrationTokenExpires: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isAcceptedTOS: {
    type: Boolean,
    default: false,
  },
  isAcceptedKVKK: {
    type: Boolean,
    default: false,
  },
  lastSmsSent: {
    type: Date,
  },
  whatsappStatus: {
    type: String,
    enum: [
      "awaiting_user_info",
      "pending_cv",
      "registered",
    ],
  },
  telegramStatus: {
    type: String,
    enum: [
      "start",
      "awaiting_phone",
      "awaiting_user_info",
      "pending_cv",
      "registered",
      "cancelled",
    ],
  },
  maritalStatus: {
    type: String,
    enum: ["married", "single"],
  },
  militaryStatus: {
    type: String,
    enum: ["completed", "exempt", "incomplete"],
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  identificationNumber: {
    type: String,
  },
  isTenantMember: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  isPersonaltyTest: {
    type: Boolean,
    default: false,
  },
  telegramChatId: {
    type: String,
  },
});

Schema.post("save", (doc) => {
  redisPublisher.publish(
    "documentSaved",
    JSON.stringify({
      modelName,
      document: doc.toJSON(),
    })
  );
});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
