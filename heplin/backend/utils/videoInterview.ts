import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { PassThrough } from "stream";
import axios from "axios";
import FormData from "form-data";

// ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
export const transcribeVideo = async (buffer, fileName = "audio.wav", mimeType = "audio/wav") => {
    try {
        const convertedBuffer = await convertToSupportedAudioFormat(buffer);

        const formData = new FormData();
        formData.append("file", convertedBuffer, {
            filename: fileName,
            contentType: mimeType,
        });
        formData.append("model", "whisper-1");
        formData.append("response_format", "verbose_json");

        const response = await axios.post(
            "https://api.openai.com/v1/audio/transcriptions",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPEN_AI}`,
                    ...formData.getHeaders(),
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Transcription failed:", error.response?.data || error.message);
        throw new Error("Transcription failed: " + error.message);
    }
};

const convertToSupportedAudioFormat = async (buffer) => {
    return new Promise((resolve, reject) => {
        const outputChunks = [];
        const readableStream = new PassThrough();

        readableStream.end(buffer);

        ffmpeg(readableStream)
            .audioCodec("pcm_s16le")
            .format("wav")
            .on("start", (commandLine) => {
            })
            .on("progress", (progress) => {
            })
            .on("error", (err) => {
                console.error("FFmpeg Hatası:", err.message);
                reject(new Error(`FFmpeg Hatası: ${err.message}`));
            })
            .on("end", () => {
                console.log("Dönüştürme tamamlandı.");
                resolve(Buffer.concat(outputChunks));
            })
            .pipe(
                new PassThrough()
                    .on("data", (chunk) => outputChunks.push(chunk))
                    .on("error", (err) => {
                        console.error("Pipe Hatası:", err.message);
                        reject(err);
                    })
            );
    });
};