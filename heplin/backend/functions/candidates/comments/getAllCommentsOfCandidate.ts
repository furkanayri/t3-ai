import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";

export default async function getAllCommentsOfCandidate(ctx: Context) {
    const { candidateId, tenantId } = ctx.params;


    const comments = await ctx.service("candidateComments").findAll({
        candidateId,
        tenantId,
    });


    const userIds = comments.results.map(comment => comment.createdBy.toString());
    const usersRes = await getAllUsersByPopulate(ctx, {
        populateIds: userIds,
        select: "name surname email",
    });

    const users = usersRes.results;

    const commentsWithUser = comments.results.map(comment => {
        const user = users.find(user => user._id.toString() === comment.createdBy.toString());
        return {
            ...comment.toJSON(),
            user: {
                _id: user?._id,
                name: user?.name,
                surname: user?.surname,
                email: user?.email,
            },
        };
    });


    ctx.body = {
        ...comments,
        results: commentsWithUser,
    };


}