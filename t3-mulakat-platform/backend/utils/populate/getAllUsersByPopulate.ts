export async function getAllUsersByPopulate(ctx: Context, payload: { populateIds?: any, select: string | undefined }) {
    const { populateIds, select } = payload;

    const query = typeof populateIds === "string" ? populateIds?.toString()?.split(",") : Array.isArray(populateIds) ? populateIds : [];

    const filter: any = {}

    if (query.length > 0) {
        filter._id = {
            $in: query
        }
    }

    if (select) {
        filter.fields = select
    }

    const response = await ctx.service("users").findAll(filter)

    return response
}