#!/usr/bin/env node

const { MongoClient, ObjectId } = require('mongodb');
const { SQSClient, GetQueueUrlCommand, SendMessageBatchCommand } = require('@aws-sdk/client-sqs');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function parseArgs(argv) {
  const result = { list: false, dryRun: false, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const separator = arg.indexOf('=');
    const name = separator === -1 ? arg : arg.slice(0, separator);
    const inlineValue = separator === -1 ? undefined : arg.slice(separator + 1);
    const value = () => inlineValue ?? argv[++index];

    if (name === '--list') result.list = inlineValue !== 'false';
    else if (name === '--dry-run') result.dryRun = inlineValue !== 'false';
    else if (name === '--force') result.force = inlineValue !== 'false';
    else if (name === '--answer-id') result.answerId = value();
    else if (name === '--file-key') result.fileKey = value();
    else if (name === '--candidate-answer-id') result.candidateAnswerId = value();
    else if (name === '--max-jobs') result.maxJobs = Number(value());
    else if (ObjectId.isValid(arg) && !result.answerId) result.answerId = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  const envBoolean = (name) => ['1', 'true', 'yes', 'on'].includes(
    String(process.env[name] || '').toLowerCase(),
  );
  if (!result.answerId && process.env.ANSWER_ID && process.env.ANSWER_ID !== 'true') {
    result.answerId = process.env.ANSWER_ID;
  }
  if (!result.fileKey && process.env.FILE_KEY && process.env.FILE_KEY !== 'true') {
    result.fileKey = process.env.FILE_KEY;
  }
  if (!result.candidateAnswerId && process.env.CANDIDATE_ANSWER_ID) {
    result.candidateAnswerId = process.env.CANDIDATE_ANSWER_ID;
  }
  if (!Number.isFinite(result.maxJobs) && process.env.CLI_MAX_JOBS) {
    result.maxJobs = Number(process.env.CLI_MAX_JOBS);
  }
  result.dryRun ||= envBoolean('DRY_RUN');
  result.force ||= envBoolean('FORCE_PUSH');
  return result;
}

function toObjectId(value, label) {
  if (!ObjectId.isValid(value)) throw new Error(`${label} is not a valid ObjectId`);
  return new ObjectId(value);
}

async function getQueueUrl(sqs, queueName) {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await sqs.send(new GetQueueUrlCommand({ QueueName: queueName }));
      return response.QueueUrl;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error(`SQS queue is not ready: ${lastError?.message}`);
}

async function collectJobs(db, options) {
  const candidateAnswers = db.collection('candidateanswers');
  const interviewQuestions = db.collection('interviewquestions');
  const candidateInterviews = db.collection('candidateinterviews');
  const processedInterviews = db.collection('processed_interviews');
  const maxJobs = Number.isFinite(options.maxJobs)
    ? Math.max(1, options.maxJobs)
    : Math.max(1, Number(process.env.MAX_JOBS || 1));

  const query = { 'interiewAnswers.0': { $exists: true } };
  if (options.candidateAnswerId) {
    query._id = toObjectId(options.candidateAnswerId, 'candidate-answer-id');
  }

  const jobs = [];
  const listRows = [];
  const cursor = candidateAnswers.find(query);

  for await (const candidateAnswer of cursor) {
    const candidateInterview = await candidateInterviews.findOne({ candidateAnswersId: candidateAnswer._id });
    if (!candidateInterview?.candidateId) continue;

    const questionSet = await interviewQuestions.findOne({ interviewId: candidateAnswer.interviewId });
    if (!questionSet?.questions?.length) continue;

    for (const answer of candidateAnswer.interiewAnswers || []) {
      if (!answer._id || !answer.fileKey) continue;
      const answerId = String(answer._id);
      if (options.answerId && answerId !== options.answerId) continue;
      if (options.fileKey && answer.fileKey !== options.fileKey) continue;

      const question = questionSet.questions.find(
        (item) => String(item._id) === String(answer.questionId),
      );
      if (!question) continue;

      const existing = await processedInterviews.findOne({
        candidateAnswerId: candidateAnswer._id,
        answerId: answer._id,
        status: 'SUCCESS',
      });

      listRows.push({
        candidateAnswerId: String(candidateAnswer._id),
        answerId,
        fileKey: answer.fileKey,
        question: question.question,
        result: existing ? 'SUCCESS' : 'NOT_PROCESSED',
      });

      if (options.list || (existing && !options.force)) continue;

      jobs.push({
        candidateAnswerId: String(candidateAnswer._id),
        answerId,
        candidateId: String(candidateInterview.candidateId),
        userId: String(candidateAnswer.userId),
        interviewId: String(candidateAnswer.interviewId),
        questionId: String(answer.questionId),
        fileKey: answer.fileKey,
        question: question.question,
        evaluationCriteria: question.evaluationCriteria || '',
      });

      if (jobs.length >= maxJobs) return { jobs, listRows };
    }
  }
  return { jobs, listRows };
}

async function sendJobs(sqs, queueUrl, jobs) {
  for (let offset = 0; offset < jobs.length; offset += 10) {
    const batch = jobs.slice(offset, offset + 10).map((job, index) => ({
      Id: `${offset + index}-${job.answerId}`.slice(0, 80),
      MessageBody: JSON.stringify(job),
    }));
    const response = await sqs.send(new SendMessageBatchCommand({ QueueUrl: queueUrl, Entries: batch }));
    if (response.Failed?.length) {
      throw new Error(`SQS rejected jobs: ${JSON.stringify(response.Failed)}`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.list && !options.answerId && !options.fileKey) {
    throw new Error('Use --answer-id or --file-key. Unfiltered bulk submission is disabled.');
  }

  const mongoUri = requiredEnv('MONGO_URI');
  const dbName = process.env.MONGO_DB_NAME || 'heplin-local';
  const mongo = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });
  await mongo.connect();

  try {
    const { jobs, listRows } = await collectJobs(mongo.db(dbName), options);
    if (options.list) {
      console.table(listRows);
      console.log(`Found ${listRows.length} local video answer(s).`);
      return;
    }
    if (!jobs.length) {
      console.log('No matching unprocessed video job was found. Use --force to reprocess SUCCESS results.');
      return;
    }
    if (options.dryRun) {
      console.log(JSON.stringify(jobs, null, 2));
      console.log(`Dry run: ${jobs.length} job(s), nothing sent.`);
      return;
    }

    const sqs = new SQSClient({
      region: process.env.AWS_REGION || 'eu-west-1',
      endpoint: requiredEnv('SQS_ENDPOINT_URL'),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    });
    const queueUrl = await getQueueUrl(sqs, process.env.SQS_QUEUE_NAME || 'VideoJobQueueLocal');
    await sendJobs(sqs, queueUrl, jobs);
    console.log(`Queued ${jobs.length} local video evaluation job(s).`);
  } finally {
    await mongo.close();
  }
}

main().catch((error) => {
  console.error(`Job pusher failed: ${error.message}`);
  process.exitCode = 1;
});
