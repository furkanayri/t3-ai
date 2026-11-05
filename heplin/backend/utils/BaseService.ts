import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  PipelineStage,
} from "mongoose";
import ApiFeatures from "./ApiFeatures";
import { IPopulateOptions, ObjectId, PaginatedResult } from "@/types/entities";

type ServiceOptions = {
  select?: string;
  disabledSoftDeleteQuery?: boolean;
  populate?: IPopulateOptions;
};

function applyFilter(filter: FilterQuery<any>, options: ServiceOptions = {}) {
  if (options.disabledSoftDeleteQuery) return filter;

  return {
    ...filter,
    isDeleted: false,
  };
}

export class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async aggregate(pipeline: PipelineStage[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }

  async findAll(
    filter: FilterQuery<T> = {},
    options?: ServiceOptions
  ): Promise<PaginatedResult<T>> {
    const apiFeatures = new ApiFeatures(
      this.model,
      applyFilter(filter, options)
    );

    return apiFeatures
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate(options?.populate ?? undefined)
      .execute();
  }

  async findOne(filter: FilterQuery<T> = {}, options?: ServiceOptions) {
    return this.model
      .findOne(applyFilter(filter, options), options?.select)
      .populate(
        typeof options?.populate === "string"
          ? [options?.populate]
          : options?.populate
      )
      .exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async create(data: Partial<T>): Promise<T | any> {
    const document = new this.model(data);
    return document.save();
  }

  async update(
    id: ObjectId,
    updateData: UpdateQuery<T>,
    options: QueryOptions = { new: true }
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, options).exec();
  }

  async updateOne(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options: QueryOptions = { new: true }
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, updateData, options).exec();
  }

  async updateMany(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options: QueryOptions = { new: true }
  ): Promise<any | null> {
    //TODO: fix the options type
    /**
            Argument of type 'QueryOptions<unknown>' is not assignable to parameter of type 'UpdateOptions & Pick<QueryOptions<T>, MongooseBaseQueryOptionKeys | "timestamps"> & { [other: string]: any; }'.
            Type 'QueryOptions<unknown>' is not assignable to type 'UpdateOptions'.
            Types of property 'readPreference' are incompatible.
            Type 'string' is not assignable to type 'ReadPreferenceLike'.
    */
    return this.model.updateMany(filter, updateData, options as any).exec();
  }

  async delete(id: string): Promise<T | any> {
    return this.model.findByIdAndDelete(id).exec();
  }
  async deleteMany(userId: string): Promise<T | any> {
    return this.model.deleteMany({ userId: userId }).exec();
  }

  async softDelete(
    id: string | ObjectId | FilterQuery<T>,
    deletedBy: ObjectId | string
  ): Promise<boolean> {
    await this.model
      .findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedBy,
          deletedAt: new Date(),
        },
        {
          new: true,
        }
      )
      .exec();

    return true;
  }

  async count(
    filter: FilterQuery<T> = {},
    options?: ServiceOptions
  ): Promise<number> {
    return this.model.countDocuments(applyFilter(filter, options)).exec();
  }
}
