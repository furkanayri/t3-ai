import { getAllUsersByPopulate } from "@/utils/populate/getAllUsersByPopulate";
import * as XLSX from 'xlsx';

export default async function applicants(ctx: Context) {
  const { jobId, tenantId, params } = ctx.params;

  const query: any = {
    status: 'applied',
  };
  const {
    page,
    limit,
    status,
    name,
    isAppliedViaWhatsapp,
    startDate,
    endDate, format
  } = ctx.query;
  const pagination = {
    page: page || 1,
    limit: limit || 10,
    sort: "-createdAt",
  };

  if (name) {
    query.$or = [
      { name: { $regex: name, $options: "i" } },
      { surname: { $regex: name, $options: "i" } },
    ];
  }

  if (isAppliedViaWhatsapp) {
    query.isAppliedViaWhatsapp = true
  }

  if (status === "onBoarding") {
    query.status = { $in: ["onBoarding", "hired"] };
    query.onboardingId = { $exists: true };
  } else {
    query.status = status;
  }

  function convertDateFormat(dateString) {
    const formattedDateString = dateString.replace(" ", "+");
    const date = new Date(formattedDateString);
    const isoString = date.toISOString();
    return isoString;
  }

  if (startDate && endDate) {
    const startDateString = Array.isArray(startDate) ? startDate[0] : startDate;
    const endDateString = Array.isArray(endDate) ? endDate[0] : endDate;
    query.createdAt = {
      gte: convertDateFormat(startDateString),
      lte: convertDateFormat(endDateString),
    };
  }

  // *** 1. Tenant'ın Kara Listeye Alınmış Adaylarını Alma ***
  const tenant = await ctx.service("tenants").findOne(
    { _id: tenantId },
  );
  const blacklistedCandidateIds = tenant.blacklistedCandidates
    ? tenant.blacklistedCandidates.map((candidateId: any) => candidateId.toString())
    : [];

  // *** 2. Job Applications Sorgusuna Kara Liste Filtrelemesi Ekleme ***
  if (blacklistedCandidateIds.length > 0) {
    query.candidateId = { $nin: blacklistedCandidateIds };
  }
  const isExcel = ctx.query.format === 'excel';

  const res = await ctx.service("jobApplications").findAll(
    {
      jobId,
      tenantId,
      ...query,
      ...(isExcel ? {} : pagination),
    },
    {
      populate: [
        {
          path: "currentRecruitmentStepId",
          select: "_id title color",
        },
        {
          path: "candidateId",
          select: "_id userId createdAt updatedAt name surname email",
        },
        {
          path: "jobId",
          select: "_id title",
        },
        {
          path: "onboardingId",
          select: "status amountAndCurrency",
        },
      ],
    }
  );


  const userRes = await getAllUsersByPopulate(ctx, {
    populateIds: res.results.map((item: any) => item.candidateId?.userId),
    select: "_id email name surname avatar phone email",
  });
  if (isExcel) {
    console.log('excel');

    const excelData = res.results.map((application: any) => {
      const user = userRes.results.find((u: any) => u._id.toString() === application.candidateId?.userId?.toString());
      return {
        'Job Title': application.jobId?.title || '',
        'Candidate Name': application.candidateId?.name || '',
        'Candidate Surname': application.candidateId?.surname || '',
        'Email': user?.email || application.candidateId?.email || '',
        'Phone': user?.phone || '',
        'Status': application.status || '',
        'Recruitment Step': application.currentRecruitmentStepId?.title || '',
        'Applied Date': new Date(application.createdAt).toLocaleDateString(),
        'Onboarding Status': application.onboardingId?.status || '',
        'Amount': application.onboardingId?.amountAndCurrency || ''
      };
    });



    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const columnWidths = Object.keys(excelData[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map((row) => String(row[key] || '').length)
      );
      return { wch: maxLength + 2 };
    });

    worksheet['!cols'] = columnWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer'
    });


    ctx.set('Content-Disposition', 'attachment; filename="adaylar.xlsx"');
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    ctx.body = Buffer.from(excelBuffer);
    return
  }



  ctx.body = {
    ...res,
    results: res.results.map((item) => {
      const user = userRes.results?.find(
        (user: any) =>
          user._id === (item.candidateId as any)?.userId?.toString()
      );
      return {
        ...item.toJSON(),
        candidateId: {
          ...(item.candidateId as any).toJSON(),
          userId: user,
        },
      };
    }),
  };
}