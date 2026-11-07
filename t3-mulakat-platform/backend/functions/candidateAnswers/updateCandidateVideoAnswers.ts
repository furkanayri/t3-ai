export default async function updateCandidateVideoAnswers(ctx: Context) {
    const id = ctx.params.candidateAnswerId;
    const { fileKey, question, questionId, responseTime, questionIndex } = ctx.request.body;

    if (!fileKey) {
        ctx.throw(400, "fileKey is required");
    }

    const payload = {
        fileKey,
        responseTime: responseTime || 0,
        question,
        questionId,
    };

    if (questionIndex) {
        await ctx.service("candidateInterview").updateOne(
            { candidateAnswersId: id },
            { questionIndex: questionIndex }
        );
    }

    const videoAnswerCreate = await ctx.service("candidateInterviewAnswers").updateOne(
        { _id: id },
        { $push: { interiewAnswers: payload } }
    );

    ctx.body = {
        isSuccess: true,
        data: videoAnswerCreate
    };
}