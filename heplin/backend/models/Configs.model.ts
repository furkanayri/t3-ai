import mongoose, { Model } from "mongoose";
import type { IConfig } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";
import { redisPublisher } from "@/utils";
import { CONFIG_KEYS } from "@/constants";

interface IResource extends IConfig { }

interface IModel extends Model<IResource> { }

const modelName = "configs";

const Schema = new BaseSchema({
    key: {
        type: String,
        unique: true,
        required: true,
        enum: CONFIG_KEYS
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
})

Schema.post("save", (doc) => {
    console.log("heyyy")
    redisPublisher.publish("documentSaved", JSON.stringify({
        modelName,
        document: doc.toJSON()
    }))
})

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);


export default Resource
