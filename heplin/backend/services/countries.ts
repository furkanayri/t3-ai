import { Model } from "mongoose";

import { ICountry } from "@/types/entities";
import Countries from "@/models/Country.model";
import { BaseService } from "@/utils";

class CountriesService extends BaseService<ICountry> {
  constructor(model: Model<ICountry>) {
    super(model);
  }
}

const service = () => new CountriesService(Countries);

export default service;
