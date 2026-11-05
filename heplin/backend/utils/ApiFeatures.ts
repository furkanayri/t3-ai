import { Document, Model } from "mongoose";
import number from "./number";
import object from "./object";
import { IPopulateOptions, PaginatedResult } from "@/types/entities";

interface QueryParams {
    [key: string]: any;
    page?: string;
    sort?: string;
    limit?: string;
    fields?: string;
}

interface Pagination {
    page: number;
    limit: number;
    skip: number;
}

interface InternalParams {
    pagination: Pagination;
    fields?: string;
    sort?: string;
}

function excludeFieldFromQuery(query: any, excludedFields: string[]) {
    const queryObj: QueryParams = { ...object(query) };
    excludedFields.forEach((el) => delete queryObj[el]);

    return JSON.parse(
        JSON.stringify(queryObj).replace(
            /\b(gte|gt|lte|lt|ne)\b/g, //TODO: write more keywords here
            (match) => `$${match}`
        )
    );
}

const excludedFields = ["page", "sort", "limit", "fields"]

class ApiFeatures<T extends Document> {
    private model: Model<T>;
    private query: any;
    private params: InternalParams;
    private queryParams: QueryParams;

    constructor(model: Model<T>, queryParams: QueryParams) {
        const page = number(queryParams.page) || 1;
        const limit = queryParams.limit ? Math.min(number(queryParams.limit), 100) : 0;
        const skip = (page - 1) * limit;
        this.model = model;
        this.query = model.find();
        this.params = {
            pagination: {
                page,
                limit,
                skip
            },
            fields: queryParams.fields,
            sort: queryParams.sort
        };
        this.queryParams = excludeFieldFromQuery(queryParams, excludedFields);
    }

    filter(): this {
        this.query = this.query.find(this.queryParams);
        return this;
    }

    sort(): this {
        if (this.params.sort) {
            const sortBy = this.params.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }

    limitFields(): this {
        if (this.params.fields) {
            const fields = this.params.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }
        return this;
    }

    paginate(): this {
        this.query = this.query.skip(this.params.pagination.skip).limit(this.params.pagination.limit);
        return this;
    }

    populate(populateOptions: IPopulateOptions): this {
        this.query = this.query.populate(populateOptions)
        return this;
    }

    async execute(): Promise<PaginatedResult<T>> {
        const results: T[] = await this.query
        const count = await this.model.countDocuments(this.queryParams);

        return {
            results,
            count,
            limit: this.params.pagination.limit,
            page: this.params.pagination.page,
            totalPage: Math.ceil(count / this.params.pagination.limit),
        };
    }
}

export default ApiFeatures;
