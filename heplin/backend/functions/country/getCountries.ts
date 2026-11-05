export default async function getCountries(ctx: Context) {
  const { search } = ctx.query;
  const query = {
    isDeleted: { $ne: true },
    ...(search && { name: { $regex: search, $options: "i" } }),
  };
  const country = await ctx.service("countries").findAll({ ...query });

  ctx.body = country;
}
