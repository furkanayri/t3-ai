import { PipelineStage, Types } from 'mongoose';
import * as XLSX from 'xlsx';

export default async function getAllCandidatesOfTenant(ctx: Context) {
  const { page, limit, fullName, jobTitle, format } = ctx.query;
  const tenantId = ctx.params.tenantId;
  const normalizedFullName = fullName ? fullName.toString().trim() : '';
  const normalizedJobTitle = jobTitle ? jobTitle.toString().trim() : '';
  const isExcel = format === 'excel';

  const pageNumber = parseInt(page as string, 10) || 1;
  const limitNumber = parseInt(limit as string, 10) || 25;

  let matchStage: any = {};

  if (normalizedFullName) {
    matchStage['$expr'] = {
      $regexMatch: {
        input: { $concat: ['$user.name', ' ', '$user.surname'] },
        regex: normalizedFullName,
        options: 'i',
      },
    };
  }

  if (normalizedJobTitle) {
    matchStage['jobs.title'] = { $regex: normalizedJobTitle, $options: 'i' };
  }

  const pipeline: PipelineStage[] = [
    {
      $match: {
        tenantId: new Types.ObjectId(tenantId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'jobapplications',
        localField: '_id',
        foreignField: 'candidateId',
        as: 'jobapplications',
      },
    },
    {
      $unwind: {
        path: '$jobapplications',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobapplications.jobId',
        foreignField: '_id',
        as: 'jobs',
      },
    },
    {
      $unwind: {
        path: '$jobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'candidateblacklists',
        let: { candidateId: '$_id', tenantId: '$tenantId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$candidateId', '$$candidateId'] },
                  { $eq: ['$tenantId', '$$tenantId'] },
                  { $eq: ['$isRemoveBlackList', false] },
                ],
              },
            },
          },
        ],
        as: 'blacklists',
      },
    },
  ];

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // Excel ise sayfalama ve sayma gereksiz
  let totalCount = 0;

  if (!isExcel) {
    const countPipeline = [...pipeline];
    countPipeline.push(
      {
        $group: {
          _id: '$_id',
          name: { $first: '$user.name' },
          surname: { $first: '$user.surname' },
          fullName: { $first: { $concat: ['$user.name', ' ', '$user.surname'] } },
          email: { $first: '$user.email' },
          jobTitles: { $push: '$jobs.title' },
          blacklists: { $first: '$blacklists' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          surname: 1,
          fullName: 1,
          email: 1,
          jobTitles: {
            $reduce: {
              input: {
                $filter: {
                  input: '$jobTitles',
                  as: 'title',
                  cond: {
                    $and: [
                      { $ne: ['$$title', null] },
                      { $ne: ['$$title', ''] },
                    ],
                  },
                },
              },
              initialValue: '',
              in: {
                $cond: {
                  if: { $eq: ['$$value', ''] },
                  then: '$$this',
                  else: { $concat: ['$$value', ', ', '$$this'] },
                },
              },
            },
          },
          blacklists: 1,
        },
      },
      { $count: 'total' }
    );

    const totalResult = await ctx.service('candidates').aggregate(countPipeline);
    totalCount = totalResult[0]?.total || 0;
  }

  pipeline.push(
    {
      $group: {
        _id: '$_id',
        name: { $first: '$user.name' },
        surname: { $first: '$user.surname' },
        fullName: { $first: { $concat: ['$user.name', ' ', '$user.surname'] } },
        email: { $first: '$user.email' },
        jobTitles: { $push: '$jobs.title' },
        blacklists: { $first: '$blacklists' },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        surname: 1,
        fullName: 1,
        email: 1,
        jobTitles: {
          $reduce: {
          input: {
            $filter: {
              input: '$jobTitles',
              as: 'title',
              cond: {
                $and: [
                  { $ne: ['$$title', null] },
                  { $ne: ['$$title', ''] },
                ],
              },
            },
          },
            initialValue: '',
            in: {
              $cond: {
                if: { $eq: ['$$value', ''] },
                then: '$$this',
                else: { $concat: ['$$value', ', ', '$$this'] },
              },
            },
          },
        },
        blacklists: 1,
      },
    }
  );

  if (!isExcel) {
    pipeline.push(
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber }
    );
  }

  const candidates = await ctx.service('candidates').aggregate(pipeline);

  if (isExcel) {

    const excelData = candidates.map((c) => ({
      'Full Name': c.fullName,
      Email: c.email,
      'Job Titles': c.jobTitles,
      Blacklisted: c.blacklists?.length > 0 ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 40 },
      { wch: 12 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    ctx.set('Content-Disposition', 'attachment; filename="candidates.xlsx"');
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    ctx.body = Buffer.from(buffer);
  } else {
    ctx.body = {
      count: totalCount,
      results: candidates,
    };
  }
}
