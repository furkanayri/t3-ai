import { Types } from "mongoose";

export default async function createDefaultCandidateProfile(ctx: Context, payload: { userId: string; tenantId: string, name: string, surname: string, email: string }) {
    const candidate = await ctx.service("candidates").findOne({
        userId: payload.userId,
        tenantId: payload.tenantId
    });

    let candidateId = candidate?._id

    if (!candidateId) {
        const candidateNew = await ctx.service("candidates").create({
            userId: new Types.ObjectId(payload.userId),
            tenantId: new Types.ObjectId(payload.tenantId),
            skills: [],
            languageSkills: [],
            name: payload.name,
            surname: payload.surname,
            email: payload.email,
        })

        candidateId = candidateNew._id
    }

    return candidateId
}