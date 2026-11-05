export default async function updateJobApplicationIsReview(ctx: Context) {
    const { id, jobId } = ctx.params;
    const { viewedBy } = ctx.request.body;
  
    if (!viewedBy || !viewedBy.employeeId) {
      ctx.throw(400, 'Invalid payload');
      return;
    }
  
    const jobApplication = await ctx.service('jobApplications').findOne({
      _id: id,
      jobId: jobId,
      'viewedBy.employeeId': viewedBy.employeeId
    });
  
    let payload: any;
  
    if (jobApplication) {
      //  employeeId varsa, ilgili alanları güncelleriz (star veya isSeen)
      payload = {
        $set: {}
      };
  
      if (viewedBy.hasOwnProperty('star')) {
        payload.$set['viewedBy.$[elem].star'] = viewedBy.star;
      }
  
      if (viewedBy.hasOwnProperty('isSeen')) {
        payload.$set['viewedBy.$[elem].isSeen'] = viewedBy.isSeen;
      }
  
      await ctx.service('jobApplications').updateOne(
        { _id: id, jobId: jobId },
        payload,
        { arrayFilters: [{ 'elem.employeeId': viewedBy.employeeId }] }
      );
    } else {
      // employeeId yoksa, viewedBy dizisine yeni bir nesne ekle
      const newViewedByEntry = {
        employeeId: viewedBy.employeeId,
        star: viewedBy.star || false,
        isSeen: viewedBy.isSeen || false,
      };
  
      payload = {
        $addToSet: {
          viewedBy: newViewedByEntry,
        },
      };
  
      await ctx.service('jobApplications').updateOne(
        { _id: id, jobId: jobId },
        payload
      );
    }
  
    ctx.body = { isSuccess: true };
  }
  