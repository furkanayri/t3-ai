import mongoose, { Model, Schema as MySchema, Types } from "mongoose";
import { ICountry } from "../types/entities";
import { BaseSchema } from "../utils/BaseSchema";

interface IResource extends ICountry { }

interface IModel extends Model<IResource> { }

const modelName = "countries";
const CitySchema = new MySchema({
  id: Number,
  name: String,
}, { _id: false });

const StateSchema = new MySchema({
  id: Number,
  name: String,
  state_code: String,
  type: String,
  cities: [CitySchema],
}, { _id: false });
const Schema = new BaseSchema({
  id: Number,
  name: String,
  phone_code: String,
  currency: String,
  region: String,
  region_id: String,
  subregion: String,
  subregion_id: String,
  translations: {
    tr: String
  },
  states: [StateSchema],
  isVisible: Boolean,
});

const Resource: IModel = mongoose.model<IResource, IModel>(modelName, Schema);

export default Resource;
