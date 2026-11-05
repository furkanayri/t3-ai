import { Context } from "koa";
import mongoose, { Types } from "mongoose";

interface ProcessedInterviewDocument {
    _id: Types.ObjectId;
    candidateAnswerId: Types.ObjectId;
    answerId: Types.ObjectId;
    questionId?: string;
    question?: string;
    evaluationCriteria?: string;
    status: "SUCCESS" | "FAILED";
    transcript?: string | null;
    evaluationScore?: number | null;
    evaluationReasoning?: string | null;
    diagnostics?: {
        hasAudio?: boolean | null;
        averageVolumeDb?: number;
        videoDurationSeconds?: number;
        processingTimeSeconds?: number;
        errors?: string[];
    };
    modelVersions?: {
        whisper?: string;
        whisperDevice?: string;
        whisperComputeType?: string;
        llm?: string;
    };
    processedAt?: Date;
}

export default async function getBatchVideoEvaluation(ctx: Context) {
    const { tenantId, candidateAnswerId } = ctx.params;

    if (!Types.ObjectId.isValid(candidateAnswerId)) {
        ctx.throw(400, "Invalid candidateAnswerId");
    }

    const candidateInterview = await ctx.service("candidateInterview").findOne({
        candidateAnswersId: candidateAnswerId,
        interviewType: "video",
    });

    if (!candidateInterview) {
        ctx.throw(404, "Video interview not found");
    }

    const candidate = await ctx.service("candidates").findOne({
        _id: candidateInterview.candidateId,
        tenantId,
    });

    if (!candidate) {
        ctx.throw(404, "Candidate not found");
    }

    const database = mongoose.connection.db;
    if (!database) {
        ctx.throw(503, "Database is not ready");
    }

    const results = await database
        .collection<ProcessedInterviewDocument>("processed_interviews")
        .find({ candidateAnswerId: new Types.ObjectId(candidateAnswerId) })
        .sort({ processedAt: 1 })
        .toArray();

    ctx.body = {
        results: results.map((result) => ({
            id: result._id.toString(),
            candidateAnswerId: result.candidateAnswerId.toString(),
            answerId: result.answerId.toString(),
            questionId: result.questionId,
            question: result.question,
            evaluationCriteria: result.evaluationCriteria,
            status: result.status,
            transcript: result.transcript ?? null,
            evaluationScore: result.evaluationScore ?? null,
            evaluationReasoning: result.evaluationReasoning ?? null,
            diagnostics: result.diagnostics ?? null,
            modelVersions: result.modelVersions ?? null,
            processedAt: result.processedAt ?? null,
        })),
    };
}
