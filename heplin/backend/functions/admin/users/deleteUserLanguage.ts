export default async function deleteUserLanguage(ctx: Context) {
    const { userId, languageId } = ctx.params;
    const admin = ctx.state.user;
    const skill = ctx
      .service("candidateLanguages")
      .softDelete({_id:languageId,userId:userId}, admin);
    ctx.body = { skill };
  }
  