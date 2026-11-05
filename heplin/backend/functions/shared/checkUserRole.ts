export default async function checkUserRole(ctx: Context) {
    if (ctx.state.user.role === 'admin') {
        console.log("admin")
    } else {
        ctx.status = 403; // Set HTTP status to 403 Forbidden
        ctx.body = 'Forbidden'; // Set HTTP body to Forbidden
    }
}