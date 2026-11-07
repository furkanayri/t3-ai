export default async function getAll(ctx: Context) {
    const { page, limit, _id, name, identificationNumber, status, email } = ctx.query;

    const pagination = {
        page: page || 1,
        limit: limit || 10,
        sort: "-createdAt",
    };

    const query: any = {}
    if (_id) {
        query._id = _id
    }
    if (name) {
        query.$or = [
            { name: { $regex: name, $options: "i" } },
            { surname: { $regex: name, $options: "i" } }
        ];
    }
    if (email) {
        query.email = { $regex: email, $options: "i" }
    }
    if (identificationNumber) {
        query.identificationNumber = identificationNumber
    }
    if (status) {
        query.status = status
    }

    const users = await ctx.service("users").findAll({
        ...query,
        ...pagination
    });

    ctx.body = users;
}