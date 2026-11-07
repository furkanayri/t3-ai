import { execFile } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import {
  loadYY25ResponseManifest,
  parseYY25Workbook,
} from "./yy25InterviewWorkbook";
import {
  inspectYY25Video,
  yy25FfmpegPath,
  YY25VideoMetadata,
} from "./yy25VideoFile";

const execFileAsync = promisify(execFile);

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function speechRateForLevel(level: number) {
  if (level >= 5) return "+0%";
  if (level === 4) return "+10%";
  return "+15%";
}

async function createWebmVideo(audioPath: string, outputPath: string) {
  await execFileAsync(
    yy25FfmpegPath,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "lavfi",
      "-i",
      "color=c=0x111827:s=640x360:r=25",
      "-i",
      audioPath,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "libvpx",
      "-b:v",
      "500k",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "libopus",
      "-b:a",
      "64k",
      "-ar",
      "48000",
      "-ac",
      "1",
      "-shortest",
      "-y",
      outputPath,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );
}

async function generateYY25InterviewVideos() {
  const questions = parseYY25Workbook();
  const manifest = loadYY25ResponseManifest();
  if (questions.length !== manifest.responses.length) {
    throw new Error("YY'25 workbook and response manifest have different question counts");
  }

  const outputDirectory = path.resolve(process.env.LOCAL_UPLOAD_DIR || ".local-uploads");
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "heplin-yy25-videos-"));
  const generatedDirectory = path.join(tempDirectory, "generated");
  fs.mkdirSync(generatedDirectory, { recursive: true });

  const tts = new MsEdgeTTS({
    connectionTimeoutMs: 20_000,
    synthesisTimeoutMs: 120_000,
  });
  const generated: Array<{ tempPath: string; metadata: YY25VideoMetadata }> = [];

  try {
    await tts.setMetadata(manifest.voice, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);

    for (const response of manifest.responses) {
      const question = questions[response.index - 1];
      const audioDirectory = path.join(tempDirectory, `audio-${String(response.index).padStart(2, "0")}`);
      fs.mkdirSync(audioDirectory, { recursive: true });

      console.log(
        `Generating ${response.fileKey} (question ${response.index}, target ${response.targetLevel}/5: ${question.competency})`,
      );
      const { audioFilePath } = await tts.toFile(
        audioDirectory,
        escapeXml(response.answer),
        {
          rate: speechRateForLevel(response.targetLevel),
          pitch: "+0Hz",
          volume: "+0%",
        },
      );
      const tempVideoPath = path.join(generatedDirectory, response.fileKey);
      await createWebmVideo(audioFilePath, tempVideoPath);
      const metadata = await inspectYY25Video(tempVideoPath);
      generated.push({ tempPath: tempVideoPath, metadata });
      console.log(
        `Validated ${response.fileKey}: ${metadata.durationSeconds.toFixed(2)} s, ${metadata.meanVolumeDb.toFixed(1)} dB`,
      );
    }

    fs.mkdirSync(outputDirectory, { recursive: true });
    for (const item of generated) {
      const finalPath = path.join(outputDirectory, item.metadata.fileKey);
      const stagedPath = `${finalPath}.tmp`;
      fs.copyFileSync(item.tempPath, stagedPath);
      fs.rmSync(finalPath, { force: true });
      fs.renameSync(stagedPath, finalPath);
    }

    console.table(
      generated.map(({ metadata }, index) => ({
        question: index + 1,
        fileKey: metadata.fileKey,
        duration: `${metadata.durationSeconds.toFixed(2)} s`,
        meanVolume: `${metadata.meanVolumeDb.toFixed(1)} dB`,
        codecs: `${metadata.videoCodec}/${metadata.audioCodec}`,
      })),
    );
    console.log(`Generated ${generated.length} YY'25 videos in ${outputDirectory}`);
  } finally {
    tts.close();
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

generateYY25InterviewVideos().catch((error) => {
  console.error(`YY'25 video generation failed: ${error.message}`);
  process.exitCode = 1;
});
