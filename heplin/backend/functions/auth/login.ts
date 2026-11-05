import { generateTokenAndSetCookie } from '@/utils';
import bcrypt from 'bcryptjs'

export default async function login(ctx: Context) {
    const { email, password } = ctx.request.body;

    if (!email) throw new Error("email is required")

    if (!password) throw new Error("password is required")

    const user = await ctx.service('users').findOne({
        email
    })

    if (!user) throw new Error("User not found")

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) throw new Error("Invalid password")

    const token = await generateTokenAndSetCookie(user._id?.toString(), ctx)

    const tenantMember = await ctx.service('tenantMembers').findOne({
        userId: user._id,
    })

    const tenant = await ctx.service('tenants').findOne({
        _id: tenantMember?.tenantId,
    })

    const permissionsRes = await ctx.service('permissions').findAll({
        userId: user._id,
    })


    user.password = undefined
    ctx.body = {
        token,
        user,
        tenant,
        permissions: permissionsRes?.results
    }
}