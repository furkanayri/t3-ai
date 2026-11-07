import { Schema, Types } from "mongoose";

export class BaseSchema extends Schema {
    constructor(payload: any, options?: any) {
        super({
            ...payload,
            isDeleted: {
                type: Boolean,
                default: false
            },
            updatedBy: {
                type: Types.ObjectId,
                ref: "Users",
                default: null
            },
            createdBy: {
                type: Types.ObjectId,
                ref: "Users",
                default: null
            },
            deletedBy: {
                type: Types.ObjectId,
                ref: "Users",
                default: null
            },
            deletedAt: {
                type: Date,
                default: null
            }
        }, { ...(options || {}), timestamps: true });
    }
}