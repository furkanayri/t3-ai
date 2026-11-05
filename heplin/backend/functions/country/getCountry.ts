export default async function getCountry(ctx: Context) {

    const { id } = ctx.params
    const country = await ctx.service("countries").findOne({ _id: id });


    ctx.body = country;
}
