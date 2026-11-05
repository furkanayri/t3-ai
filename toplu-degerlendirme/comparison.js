#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { MongoClient, ObjectId } = require('mongodb');
const {
  SQSClient,
  GetQueueUrlCommand,
  PurgeQueueCommand,
  SendMessageBatchCommand,
} = require('@aws-sdk/client-sqs');

const ROOT = __dirname;
const RUNS_DIR = path.join(ROOT, '.local-runs');
const COMPOSE_FILE = path.join(ROOT, 'docker-compose.local.yml');
const DEFAULT_SEED = 20261102;
const DEFAULT_SAMPLE_SIZE = 150;
const SCORE_BANDS = [
  { name: '0-2.49', min: 0, max: 2.5 },
  { name: '2.5-4.99', min: 2.5, max: 5 },
  { name: '5-7.49', min: 5, max: 7.5 },
  { name: '7.5-10', min: 7.5, max: 10.000001 },
];

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const options = {};
  const positional = [];
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const separator = arg.indexOf('=');
    const name = (separator === -1 ? arg.slice(2) : arg.slice(2, separator))
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = separator === -1 ? rest[index + 1] : arg.slice(separator + 1);
    if (separator === -1 && value && !value.startsWith('--')) index += 1;
    options[name] = value && !value.startsWith('--') ? value : true;
  }
  // npm 11 exposes unknown --name options as npm_config_name and forwards only
  // their values on Windows. Supporting both forms keeps the documented npm
  // commands and direct `node comparison.js` usage equivalent.
  const npmValue = (name) => {
    const value = process.env[name];
    return value && !['true', 'false'].includes(value.toLowerCase()) ? value : undefined;
  };
  options.source ||= npmValue('npm_config_source');
  options.sampleSize ||= npmValue('npm_config_sample_size');
  options.seed ||= npmValue('npm_config_seed');
  options.runId ||= npmValue('npm_config_run_id');
  if (command === 'prepare') {
    options.source ||= positional[0];
    options.sampleSize ||= positional[1];
    if (positional[2] && /^\d+$/.test(positional[2]) && positional.length > 3) {
      options.seed ||= positional[2];
      options.runId ||= positional[3];
    } else {
      options.runId ||= positional[2];
    }
  } else {
    options.runId ||= positional[0];
  }
  return { command, options };
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function scoreBand(score) {
  return SCORE_BANDS.find((band) => score >= band.min && score < band.max)?.name || 'unknown';
}

function balancedOrder(candidates, seed) {
  const random = mulberry32(seed);
  const questions = new Map();
  for (const candidate of candidates) {
    if (!questions.has(candidate.questionId)) {
      questions.set(candidate.questionId, new Map(SCORE_BANDS.map((band) => [band.name, []])));
    }
    questions.get(candidate.questionId).get(candidate.scoreBand).push(candidate);
  }
  const questionIds = shuffle([...questions.keys()].sort(), random);
  for (const bands of questions.values()) {
    for (const [name, values] of bands) bands.set(name, shuffle(values, random));
  }
  const bandOffsets = new Map(questionIds.map((id) => [id, Math.floor(random() * SCORE_BANDS.length)]));
  const selectedPerQuestion = new Map(questionIds.map((id) => [id, 0]));
  const ordered = [];
  let madeProgress = true;
  while (madeProgress) {
    madeProgress = false;
    for (const questionId of questionIds) {
      const bands = questions.get(questionId);
      const count = selectedPerQuestion.get(questionId);
      const offset = (bandOffsets.get(questionId) + count) % SCORE_BANDS.length;
      let picked = null;
      for (let step = 0; step < SCORE_BANDS.length; step += 1) {
        const band = SCORE_BANDS[(offset + step) % SCORE_BANDS.length];
        if (bands.get(band.name).length) {
          picked = bands.get(band.name).shift();
          break;
        }
      }
      if (picked) {
        ordered.push(picked);
        selectedPerQuestion.set(questionId, count + 1);
        madeProgress = true;
      }
    }
  }
  return ordered;
}

function toId(value) {
  return value == null ? '' : String(value);
}

function isObjectId(value) {
  return ObjectId.isValid(toId(value));
}

function resolveFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    return require(path.join(ROOT, '..', 'heplin', 'backend', 'node_modules', '@ffmpeg-installer', 'ffmpeg')).path;
  } catch {
    return 'ffmpeg';
  }
}

function validateVideo(filePath, ffmpegPath) {
  const result = spawnSync(ffmpegPath, [
    '-v', 'error', '-xerror', '-i', filePath, '-map', '0:v:0?', '-map', '0:a:0?', '-f', 'null', '-',
  ], { encoding: 'utf8', windowsHide: true, timeout: 10 * 60 * 1000 });
  if (result.error) return { valid: false, error: result.error.message };
  if (result.status !== 0) return { valid: false, error: (result.stderr || `FFmpeg ${result.status}`).trim() };
  return { valid: true };
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const input = fs.createReadStream(filePath);
    input.on('error', reject);
    input.on('data', (chunk) => hash.update(chunk));
    input.on('end', () => resolve(hash.digest('hex')));
  });
}

async function atomicJson(filePath, value) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp-${process.pid}`;
  await fsp.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fsp.rename(temporary, filePath);
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fsp.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function resolveRunId(requested) {
  if (requested) return requested;
  const current = await readJson(path.join(RUNS_DIR, 'current.json'));
  if (!current?.runId) throw new Error('Hazırlanmış bir karşılaştırma yok. Önce compare:prepare:local çalıştırın.');
  return current.runId;
}

async function loadRun(requested) {
  const runId = await resolveRunId(requested);
  const runDir = path.join(RUNS_DIR, runId);
  const manifest = await readJson(path.join(runDir, 'manifest.json'));
  if (!manifest) throw new Error(`Koşu bulunamadı: ${runId}`);
  return { runId, runDir, manifest };
}

async function loadResults(runDir) {
  const resultsDir = path.join(runDir, 'results');
  let names = [];
  try {
    names = (await fsp.readdir(resultsDir)).filter((name) => name.endsWith('.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const results = [];
  for (const name of names) {
    const result = await readJson(path.join(resultsDir, name));
    if (result) results.push(result);
  }
  return results;
}

async function hydrateCandidates(db, historical) {
  const answerIds = [...new Set(historical.map((item) => toId(item.candidateAnswerId)).filter(isObjectId))]
    .map((id) => new ObjectId(id));
  const answerDocuments = await db.collection('candidateanswers').find({ _id: { $in: answerIds } }).toArray();
  const answersById = new Map(answerDocuments.map((item) => [toId(item._id), item]));
  const candidateInterviews = await db.collection('candidateinterviews')
    .find({ candidateAnswersId: { $in: answerIds } }).toArray();
  const interviewsByAnswer = new Map(candidateInterviews.map((item) => [toId(item.candidateAnswersId), item]));
  const interviewIds = [...new Set(answerDocuments.map((item) => toId(item.interviewId)).filter(isObjectId))]
    .map((id) => new ObjectId(id));
  const questionSets = await db.collection('interviewquestions').find({ interviewId: { $in: interviewIds } }).toArray();
  const questionsByInterview = new Map(questionSets.map((item) => [toId(item.interviewId), item.questions || []]));

  const candidates = [];
  for (const historicalResult of historical) {
    const candidateAnswer = answersById.get(toId(historicalResult.candidateAnswerId));
    if (!candidateAnswer) continue;
    const answer = (candidateAnswer.interiewAnswers || []).find(
      (item) => toId(item._id) === toId(historicalResult.answerId) || item.fileKey === historicalResult.fileKey,
    );
    if (!answer?._id) continue;
    const interviewId = historicalResult.interviewId || candidateAnswer.interviewId;
    const questionId = toId(historicalResult.questionId || answer.questionId);
    const question = (questionsByInterview.get(toId(interviewId)) || [])
      .find((item) => toId(item._id) === questionId);
    const candidateInterview = interviewsByAnswer.get(toId(candidateAnswer._id));
    const oldScore = Number(historicalResult.evaluationScore);
    if (!Number.isFinite(oldScore) || !questionId || !interviewId || !candidateInterview?.candidateId) continue;
    candidates.push({
      candidateAnswerId: toId(candidateAnswer._id),
      answerId: toId(answer._id),
      candidateId: toId(candidateInterview.candidateId),
      userId: toId(historicalResult.userId || candidateAnswer.userId),
      interviewId: toId(interviewId),
      questionId,
      fileKey: historicalResult.fileKey,
      question: historicalResult.question || question?.question || '',
      evaluationCriteria: historicalResult.evaluationCriteria || question?.evaluationCriteria || '',
      oldScore,
      scoreBand: scoreBand(oldScore),
      historicalProcessedAt: historicalResult.processedAt || null,
      historicalModel: historicalResult.modelVersions?.llm || historicalResult.ollamaModel || 'gemma3:12b',
    });
  }
  return candidates.filter((item) => item.question && item.evaluationCriteria && item.userId);
}

async function findWebmFiles(root) {
  const pending = [root];
  const files = [];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of await fsp.readdir(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.webm')) files.push(entryPath);
    }
  }
  return files;
}

async function prepare(options) {
  const requestedSource = path.resolve(String(options.source || ''));
  const sampleSize = Math.max(1, Number(options.sampleSize || DEFAULT_SAMPLE_SIZE));
  const seed = Number(options.seed || DEFAULT_SEED);
  if (!options.source) throw new Error('--source zorunludur.');
  const sourceStat = await fsp.stat(requestedSource).catch(() => null);
  if (!sourceStat?.isDirectory()) throw new Error(`Video klasörü bulunamadı: ${requestedSource}`);
  const videoPaths = await findWebmFiles(requestedSource);
  const parentDirectories = new Set(videoPaths.map((filePath) => path.dirname(filePath)));
  if (parentDirectories.size > 1) {
    throw new Error('Videolar birden fazla alt klasörde. Worker için tek bir video klasörü seçin.');
  }
  const source = parentDirectories.size === 1 ? [...parentDirectories][0] : requestedSource;
  const fileNames = videoPaths.map((filePath) => path.basename(filePath));
  if (new Set(fileNames).size !== fileNames.length) throw new Error('Kaynakta aynı ada sahip birden fazla video var.');
  if (!fileNames.length) throw new Error('Kaynak klasörde .webm videosu bulunamadı.');

  const mongo = new MongoClient(process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/heplin-local', {
    serverSelectionTimeoutMS: 10000,
  });
  await mongo.connect();
  let candidates;
  try {
    const db = mongo.db(process.env.MONGO_DB_NAME || 'heplin-local');
    const documents = await db.collection('processed_interviews').find({
      status: 'SUCCESS',
      fileKey: { $in: fileNames },
      evaluationScore: { $type: 'number' },
    }).sort({ processedAt: -1, _id: -1 }).toArray();
    const latest = [];
    const seen = new Set();
    for (const item of documents) {
      if (seen.has(item.fileKey)) continue;
      seen.add(item.fileKey);
      latest.push(item);
    }
    candidates = await hydrateCandidates(db, latest);
  } finally {
    await mongo.close();
  }
  if (candidates.length < sampleSize) {
    throw new Error(`Yeterli eşleşmiş başarılı video yok: ${candidates.length}/${sampleSize}`);
  }

  const order = balancedOrder(candidates, seed);
  const ffmpegPath = resolveFfmpeg();
  const selected = [];
  const rejected = [];
  for (const candidate of order) {
    if (selected.length >= sampleSize) break;
    const videoPath = path.join(source, candidate.fileKey);
    const stat = await fsp.stat(videoPath).catch(() => null);
    if (!stat?.isFile()) {
      rejected.push({ fileKey: candidate.fileKey, reason: 'FILE_NOT_FOUND' });
      continue;
    }
    if (!options.skipVideoValidation) {
      const validation = validateVideo(videoPath, ffmpegPath);
      if (!validation.valid) {
        rejected.push({ fileKey: candidate.fileKey, reason: validation.error.slice(0, 500) });
        continue;
      }
    }
    selected.push({
      ...candidate,
      sourceSha256: await sha256(videoPath),
      sourceSizeBytes: stat.size,
    });
    process.stdout.write(`\rDoğrulanan video: ${selected.length}/${sampleSize}`);
  }
  process.stdout.write('\n');
  if (selected.length < sampleSize) {
    throw new Error(`Doğrulama sonrasında örneklem tamamlanamadı: ${selected.length}/${sampleSize}`);
  }

  const now = new Date();
  const runId = options.runId || `compare-${now.toISOString().replace(/[:.]/g, '-').slice(0, 19)}-${seed}`;
  if (!/^[a-zA-Z0-9_-]+$/.test(runId)) throw new Error('run-id yalnızca harf, sayı, _ ve - içerebilir.');
  const runDir = path.join(RUNS_DIR, runId);
  if (await readJson(path.join(runDir, 'manifest.json'))) throw new Error(`run-id zaten var: ${runId}`);
  const manifest = {
    schemaVersion: 1,
    runId,
    createdAt: now.toISOString(),
    sourceDirectory: source,
    sampleSize,
    seed,
    historicalModel: 'gemma3:12b',
    newModels: { whisper: 'large-v3', llm: 'gemma3:4b' },
    selection: 'question-and-score-band-balanced',
    rejectedDuringValidation: rejected,
    items: selected,
  };
  await atomicJson(path.join(runDir, 'manifest.json'), manifest);
  await atomicJson(path.join(runDir, 'state.json'), {
    runId, status: 'prepared', preparedAt: now.toISOString(), updatedAt: now.toISOString(),
  });
  await atomicJson(path.join(RUNS_DIR, 'current.json'), { runId, updatedAt: now.toISOString() });

  const questionCounts = Object.fromEntries([...new Set(selected.map((item) => item.questionId))]
    .sort().map((id) => [id, selected.filter((item) => item.questionId === id).length]));
  const bandCounts = Object.fromEntries(SCORE_BANDS.map((band) => [
    band.name, selected.filter((item) => item.scoreBand === band.name).length,
  ]));
  console.log(`Koşu hazırlandı: ${runId}`);
  console.log(`Eşleşen başarılı aday: ${candidates.length}; seçilen: ${selected.length}; soru: ${Object.keys(questionCounts).length}`);
  console.log(`Puan bantları: ${JSON.stringify(bandCounts)}`);
  console.log(`Dashboard: http://localhost:4180/runs/${runId}`);
}

function createSqs() {
  return new SQSClient({
    region: process.env.AWS_REGION || 'eu-west-1',
    endpoint: process.env.SQS_ENDPOINT_URL || 'http://127.0.0.1:4566',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  });
}

async function waitForQueue(sqs, queueName) {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      return (await sqs.send(new GetQueueUrlCommand({ QueueName: queueName }))).QueueUrl;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`Karşılaştırma kuyruğu hazır değil: ${lastError?.message}`);
}

async function sendJobs(sqs, queueUrl, jobs) {
  for (let offset = 0; offset < jobs.length; offset += 10) {
    const entries = jobs.slice(offset, offset + 10).map((job, index) => ({
      Id: `${offset + index}-${job.answerId}`.slice(0, 80),
      MessageBody: JSON.stringify(job),
    }));
    const response = await sqs.send(new SendMessageBatchCommand({ QueueUrl: queueUrl, Entries: entries }));
    if (response.Failed?.length) throw new Error(`SQS işleri reddetti: ${JSON.stringify(response.Failed)}`);
  }
}

function dockerCompose(args, options = {}) {
  const result = spawnSync('docker', ['compose', '-f', COMPOSE_FILE, ...args], {
    cwd: ROOT,
    env: { ...process.env, ...options.env },
    encoding: 'utf8',
    windowsHide: true,
    stdio: options.inherit ? 'inherit' : 'pipe',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `docker compose ${result.status}`);
  return result.stdout || '';
}

async function startDashboard(run) {
  dockerCompose(['--profile', 'compare', 'up', '-d', '--build', 'localstack', 'dashboard'], {
    env: { COMPARE_SOURCE_DIR: run?.manifest?.sourceDirectory || '' },
  });
  console.log('Dashboard: http://localhost:4180');
  if (run) console.log(`Koşu: http://localhost:4180/runs/${run.runId}`);
}

async function executeRun(options, resume = false) {
  const run = await loadRun(options.runId);
  const existing = await loadResults(run.runDir);
  const completedIds = new Set(existing.map((item) => toId(item.answerId)));
  const pending = run.manifest.items.filter((item) => !completedIds.has(item.answerId));
  await startDashboard(run);
  if (!pending.length) {
    console.log('Tüm videolar daha önce işlendi. Rapor yenileniyor.');
    await writeReport(run);
    return;
  }
  const sqs = createSqs();
  const queueName = process.env.COMPARISON_SQS_QUEUE_NAME || 'VideoComparisonQueueLocal';
  const queueUrl = await waitForQueue(sqs, queueName);
  try {
    await sqs.send(new PurgeQueueCommand({ QueueUrl: queueUrl }));
  } catch (error) {
    if (!String(error.message).toLowerCase().includes('purge')) throw error;
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  const jobs = pending.map((item) => ({ ...item, runId: run.runId }));
  await sendJobs(sqs, queueUrl, jobs);
  const now = new Date().toISOString();
  await atomicJson(path.join(run.runDir, 'state.json'), {
    runId: run.runId,
    status: 'queued',
    queuedAt: now,
    updatedAt: now,
    queuedCount: jobs.length,
    resumed: resume,
  });
  console.log(`${jobs.length} video yerel karşılaştırma kuyruğuna eklendi.`);
  console.log(`Canlı takip: http://localhost:4180/runs/${run.runId}`);

  const child = spawn('docker', [
    'compose', '-f', COMPOSE_FILE, '--profile', 'compare', 'run', '--rm', '--build',
    '-e', `RUN_ID=${run.runId}`,
    '-e', `MAX_VIDEOS_TO_PROCESS=${jobs.length}`,
    'comparison-worker',
  ], {
    cwd: ROOT,
    env: {
      ...process.env,
      COMPARE_SOURCE_DIR: run.manifest.sourceDirectory,
      COMPARE_RUN_ID: run.runId,
      COMPARE_MAX_VIDEOS: String(jobs.length),
    },
    stdio: 'inherit',
    windowsHide: true,
  });
  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', resolve);
  });
  if (exitCode !== 0) throw new Error(`Karşılaştırma worker'ı ${exitCode} koduyla kapandı.`);
  await writeReport(run);
  console.log(`Rapor: http://localhost:4180/runs/${run.runId}/report`);
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function pearson(left, right) {
  if (left.length < 2) return null;
  const leftMean = mean(left);
  const rightMean = mean(right);
  let numerator = 0;
  let leftSquare = 0;
  let rightSquare = 0;
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index] - leftMean;
    const b = right[index] - rightMean;
    numerator += a * b;
    leftSquare += a * a;
    rightSquare += b * b;
  }
  const denominator = Math.sqrt(leftSquare * rightSquare);
  return denominator ? numerator / denominator : null;
}

function ranks(values) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const output = Array(values.length);
  for (let start = 0; start < sorted.length;) {
    let end = start + 1;
    while (end < sorted.length && sorted[end].value === sorted[start].value) end += 1;
    const rank = (start + 1 + end) / 2;
    for (let index = start; index < end; index += 1) output[sorted[index].index] = rank;
    start = end;
  }
  return output;
}

function calculateMetrics(manifest, results) {
  const oldByAnswer = new Map(manifest.items.map((item) => [item.answerId, item]));
  const completed = results.filter((item) => oldByAnswer.has(toId(item.answerId)));
  const successful = completed.filter((item) => item.status === 'SUCCESS' && Number.isFinite(Number(item.evaluationScore)));
  const rows = successful.map((result) => {
    const item = oldByAnswer.get(toId(result.answerId));
    const newScore = Number(result.evaluationScore);
    const difference = Math.abs(item.oldScore - newScore);
    return { ...item, newScore, difference, similarity: Math.max(0, 100 - 10 * difference), result };
  });
  const differences = rows.map((item) => item.difference);
  const similarities = rows.map((item) => item.similarity);
  const oldScores = rows.map((item) => item.oldScore);
  const newScores = rows.map((item) => item.newScore);
  const questionGroups = new Map();
  for (const row of rows) {
    if (!questionGroups.has(row.questionId)) questionGroups.set(row.questionId, []);
    questionGroups.get(row.questionId).push(row);
  }
  return {
    total: manifest.items.length,
    completed: completed.length,
    success: successful.length,
    failed: completed.length - successful.length,
    pending: manifest.items.length - completed.length,
    meanSimilarity: mean(similarities),
    effectiveSimilarity: completed.length ? similarities.reduce((sum, value) => sum + value, 0) / completed.length : null,
    mae: mean(differences),
    rmse: differences.length ? Math.sqrt(mean(differences.map((value) => value * value))) : null,
    exactRate: differences.length ? 100 * differences.filter((value) => value < 0.005).length / differences.length : null,
    withinOneRate: differences.length ? 100 * differences.filter((value) => value <= 1).length / differences.length : null,
    withinTwoRate: differences.length ? 100 * differences.filter((value) => value <= 2).length / differences.length : null,
    pearson: pearson(oldScores, newScores),
    spearman: pearson(ranks(oldScores), ranks(newScores)),
    questionBreakdown: [...questionGroups.entries()].map(([questionId, values]) => ({
      questionId,
      question: values[0].question,
      count: values.length,
      meanSimilarity: mean(values.map((item) => item.similarity)),
      mae: mean(values.map((item) => item.difference)),
    })).sort((a, b) => a.question.localeCompare(b.question, 'tr')),
    rows,
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function format(value, digits = 2) {
  return value == null || Number.isNaN(value) ? '—' : Number(value).toFixed(digits);
}

function reportHtml(run, metrics) {
  const rows = metrics.rows.map((item) => `<tr><td>${escapeHtml(item.question)}</td><td>${format(item.oldScore)}</td><td>${format(item.newScore)}</td><td>${format(item.similarity)}%</td><td>${escapeHtml(item.fileKey)}</td></tr>`).join('');
  const questions = metrics.questionBreakdown.map((item) => `<tr><td>${escapeHtml(item.question)}</td><td>${item.count}</td><td>${format(item.meanSimilarity)}%</td><td>${format(item.mae)}</td></tr>`).join('');
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yerel AI Karşılaştırma Raporu</title><style>
  body{font:15px system-ui;background:#f5f7fb;color:#172033;margin:0;padding:32px}.wrap{max-width:1200px;margin:auto}.card{background:#fff;border:1px solid #e5e9f2;border-radius:16px;padding:22px;margin:16px 0;box-shadow:0 8px 24px #19213b0d}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}.metric b{display:block;font-size:28px;color:#6d28d9;margin-top:6px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid #edf0f6}th{color:#64748b}.muted{color:#64748b}h1,h2{margin:0 0 12px}@media print{body{background:white;padding:0}.card{box-shadow:none}}
  </style></head><body><div class="wrap"><h1>150 Videoluk Yerel AI Karşılaştırması</h1><p class="muted">Koşu: ${escapeHtml(run.runId)} · Gemma 3 12B → Gemma 3 4B · Whisper large-v3</p>
  <section class="card grid"><div class="metric">Başarılı<b>${metrics.success}/${metrics.total}</b></div><div class="metric">Ortalama benzerlik<b>${format(metrics.meanSimilarity)}%</b></div><div class="metric">Etkin benzerlik<b>${format(metrics.effectiveSimilarity)}%</b></div><div class="metric">MAE<b>${format(metrics.mae)}</b></div><div class="metric">RMSE<b>${format(metrics.rmse)}</b></div><div class="metric">Pearson<b>${format(metrics.pearson,3)}</b></div><div class="metric">Spearman<b>${format(metrics.spearman,3)}</b></div></section>
  <section class="card grid"><div class="metric">Tam eşleşme<b>${format(metrics.exactRate)}%</b></div><div class="metric">±1 puan<b>${format(metrics.withinOneRate)}%</b></div><div class="metric">±2 puan<b>${format(metrics.withinTwoRate)}%</b></div><div class="metric">Başarısız<b>${metrics.failed}</b></div></section>
  <section class="card"><h2>Soru bazında sonuçlar</h2><table><thead><tr><th>Soru</th><th>Video</th><th>Benzerlik</th><th>MAE</th></tr></thead><tbody>${questions}</tbody></table></section>
  <section class="card"><h2>Video sonuçları</h2><table><thead><tr><th>Soru</th><th>Eski</th><th>Yeni</th><th>Benzerlik</th><th>Dosya anahtarı</th></tr></thead><tbody>${rows}</tbody></table></section>
  </div></body></html>`;
}

async function writeReport(run) {
  const results = await loadResults(run.runDir);
  const metrics = calculateMetrics(run.manifest, results);
  await fsp.writeFile(path.join(run.runDir, 'report.html'), reportHtml(run, metrics), 'utf8');
  await atomicJson(path.join(run.runDir, 'metrics.json'), { ...metrics, rows: undefined });
  console.log(`HTML raporu yazıldı: ${path.join(run.runDir, 'report.html')}`);
}

async function status(options) {
  const run = await loadRun(options.runId);
  const state = await readJson(path.join(run.runDir, 'state.json'), {});
  const metrics = calculateMetrics(run.manifest, await loadResults(run.runDir));
  console.log(JSON.stringify({ runId: run.runId, state, metrics: { ...metrics, rows: undefined } }, null, 2));
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command === 'prepare') await prepare(options);
  else if (command === 'run') await executeRun(options, false);
  else if (command === 'resume') await executeRun(options, true);
  else if (command === 'dashboard') {
    const run = await loadRun(options.runId).catch(() => null);
    await startDashboard(run);
  } else if (command === 'report') {
    const run = await loadRun(options.runId);
    await writeReport(run);
    console.log(`Rapor: http://localhost:4180/runs/${run.runId}/report`);
  } else if (command === 'status') await status(options);
  else if (command === 'down') {
    dockerCompose(['--profile', 'compare', 'stop', 'dashboard']);
    console.log('Karşılaştırma dashboard servisi durduruldu.');
  } else {
    console.log('Kullanım: node comparison.js <prepare|run|resume|dashboard|report|status|down> [seçenekler]');
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Karşılaştırma işlemi başarısız: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { balancedOrder, calculateMetrics, scoreBand };
