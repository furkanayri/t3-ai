import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
export const yy25FfmpegPath = require("@ffmpeg-installer/ffmpeg").path as string;

export interface YY25VideoMetadata {
  fileKey: string;
  durationSeconds: number;
  meanVolumeDb: number;
  videoCodec: string;
  audioCodec: string;
  resolution: string;
}

function durationFromFfmpeg(output: string) {
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error("FFmpeg could not determine video duration");
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

export async function inspectYY25Video(videoPath: string): Promise<YY25VideoMetadata> {
  let stderr = "";
  try {
    const result = await execFileAsync(
      yy25FfmpegPath,
      [
        "-hide_banner",
        "-nostats",
        "-i",
        videoPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0",
        "-af",
        "volumedetect",
        "-f",
        "null",
        "-",
      ],
      { maxBuffer: 10 * 1024 * 1024 },
    );
    stderr = result.stderr;
  } catch (error) {
    stderr = String(error?.stderr || error?.message || error);
    throw new Error(`Video validation failed for ${path.basename(videoPath)}: ${stderr}`);
  }

  const videoCodec = stderr.match(/Video:\s*([^,\s]+)/)?.[1] || "";
  const audioCodec = stderr.match(/Audio:\s*([^,\s]+)/)?.[1] || "";
  const resolution = stderr.match(/Video:[^\n]*?\b(\d{2,5}x\d{2,5})\b/)?.[1] || "";
  const meanVolumeDb = Number(stderr.match(/mean_volume:\s*(-?[\d.]+)\s*dB/)?.[1]);
  const durationSeconds = durationFromFfmpeg(stderr);

  if (videoCodec !== "vp8") {
    throw new Error(`${path.basename(videoPath)} must use VP8 video, found ${videoCodec || "unknown"}`);
  }
  if (audioCodec !== "opus") {
    throw new Error(`${path.basename(videoPath)} must use Opus audio, found ${audioCodec || "unknown"}`);
  }
  if (resolution !== "640x360") {
    throw new Error(
      `${path.basename(videoPath)} must be 640x360, found ${resolution || "unknown"}`,
    );
  }
  if (!(durationSeconds > 2 && durationSeconds < 60)) {
    throw new Error(
      `${path.basename(videoPath)} duration must be between 2 and 60 seconds, found ${durationSeconds}`,
    );
  }
  if (!Number.isFinite(meanVolumeDb) || meanVolumeDb <= -45) {
    throw new Error(
      `${path.basename(videoPath)} does not contain usable audio (mean ${meanVolumeDb} dB)`,
    );
  }

  return {
    fileKey: path.basename(videoPath),
    durationSeconds,
    meanVolumeDb,
    videoCodec,
    audioCodec,
    resolution,
  };
}
