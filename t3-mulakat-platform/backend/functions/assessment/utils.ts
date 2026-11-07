import { Context } from 'koa';
import moment from 'moment';
import { IAssessmentStage } from '@/types/entities';

export type LiveStageStatus = 'pending' | 'in-progress' | 'completed' | 'expired';

// Bir asamanin guncel statusunu bagli somut kayittan canli okur.
export async function computeStageStatus(
    ctx: Context,
    userId: any,
    stage: IAssessmentStage,
    progress: any
): Promise<LiveStageStatus> {
    if (stage.type === 'personality_test') {
        const session = await ctx.service('personalityTestSession').findOne({
            userId,
            status: { $in: ['completed', 'in-progress', 'expired'] },
        });
        if (!session) return 'pending';
        if (session.status === 'completed') return 'completed';
        if (session.status === 'expired') return 'expired';
        return 'in-progress';
    }

    if (stage.type === 'text_interview' || stage.type === 'video_interview') {
        if (!progress?.refInstanceId) return 'pending';
        const ci = await ctx.service('candidateInterview').findById(String(progress.refInstanceId));
        if (!ci) return 'pending';
        if (ci.status === 'completed') return 'completed';
        if (ci.status === 'expired') return 'expired';
        if (ci.status === 'started') return 'in-progress';
        return 'pending';
    }

    if (stage.type === 'quiz') {
        if (!progress?.refInstanceId) return 'pending';
        const qa = await ctx.service('userQuizAssignments').findOne({ _id: progress.refInstanceId });
        if (!qa) return 'pending';
        // Quiz'i bitirmek yeterli: gecer/kalir fark etmeksizin tamamlanmis bir oturum varsa asama tamamlandi sayilir.
        const completedSession = await ctx.service('quizSessions').findOne({
            assignmentId: progress.refInstanceId,
            status: 'completed',
        });
        if (completedSession) return 'completed';
        if (qa.status === 'completed') return 'completed';
        if (qa.status === 'overdue' || qa.status === 'cancelled') return 'expired';
        if (qa.status === 'started') return 'in-progress';
        return 'pending';
    }

    return 'pending';
}

// Bir atamanin asamalarini siralı ve canli statulu olarak hesaplar.
// getMyAssessment (tek surec detayi) ve getMyAssessments (liste ozeti) tarafindan paylasilir.
export async function buildAssessmentStages(ctx: Context, userId: any, assignment: any) {
    const process: any = assignment.assessmentProcessId;

    const stageDocs = await ctx.service('assessmentStage').findAll({
        assessmentProcessId: process._id,
        isDeleted: { $ne: true },
        limit: 1000,
    } as any);

    const stagesById: Record<string, any> = {};
    stageDocs.results.forEach((s: any) => { stagesById[String(s._id)] = s; });

    const orderIds = (process.stagesSort || []).map((id: any) => String(id));
    const orderedStages = orderIds.map((id: string) => stagesById[id]).filter(Boolean);
    const stages = orderedStages.length ? orderedStages : stageDocs.results;

    const progresses = await ctx.service('assessmentStageProgress').findAll({
        assignmentId: assignment._id,
        limit: 1000,
    } as any);
    const progressByStage: Record<string, any> = {};
    progresses.results.forEach((p: any) => { progressByStage[String(p.stageId)] = p; });

    let prevSatisfied = true;
    const result: any[] = [];

    for (const stage of stages) {
        const progress = progressByStage[String(stage._id)];
        let status: string = await computeStageStatus(ctx, userId, stage, progress);

        const locked = Boolean(process.sequential) && !prevSatisfied;
        if (locked && status === 'pending') status = 'locked';

        result.push({
            stageId: stage._id,
            type: stage.type,
            title: stage.title,
            refId: stage.refId,
            required: stage.required,
            status,
            locked,
            refInstanceId: progress?.refInstanceId ?? null,
        });

        const satisfied = status === 'completed' || stage.required === false;
        prevSatisfied = prevSatisfied && satisfied;
    }

    const allRequiredDone = result.length > 0 && result.every(
        (s) => s.status === 'completed' || s.required === false
    );

    // Tum zorunlu asamalar tamamlandiysa atamayi completed yap
    if (allRequiredDone && assignment.status !== 'completed') {
        await ctx.service('assessmentAssignment').updateOne(
            { _id: assignment._id },
            { status: 'completed' }
        );
    }

    return { process, stages: result, allRequiredDone };
}

// text/video mulakat asamasi icin candidateInterview ornegini olusturur, id'sini dondurur.
export async function createInterviewInstance(
    ctx: Context,
    userId: any,
    tenantId: any,
    stage: IAssessmentStage
): Promise<any> {
    const interview = await ctx.service('interview').findById(String(stage.refId));
    if (!interview) ctx.throw(404, 'Mulakat bulunamadi');

    const interviewQuestion = await ctx.service('interviewQuestions').findOne({ interviewId: interview._id });
    let questionTimeSum = 0;
    if (interviewQuestion && interviewQuestion.questions) {
        questionTimeSum = interviewQuestion.questions.reduce(
            (sum: number, q: any) => sum + (q.duration || 0),
            0
        );
    }

    let candidate = await ctx.service('candidates').findOne({ userId });
    if (!candidate) {
        const user = await ctx.service('users').findOne({ _id: userId });
        candidate = await ctx.service('candidates').create({
            userId,
            name: user?.name,
            surname: (user as any)?.surname,
            email: user?.email,
            tenantId,
        } as any);
    }

    const answers = await ctx.service('candidateInterviewAnswers').create({
        userId,
        interviewId: interview._id,
    } as any);

    const interviewType = stage.type === 'video_interview' ? 'video' : 'text';
    const expirationDate = moment().add(stage.deadlineDays || 7, 'days').toDate();

    const candidateInterview = await ctx.service('candidateInterview').create({
        name: interview.name,
        totalDuration: questionTimeSum || 0,
        userId,
        candidateId: candidate._id,
        interviewId: interview._id,
        interviewType,
        candidateAnswersId: answers._id,
        expirationDate,
    } as any);

    return candidateInterview._id;
}

// quiz asamasi icin userQuizAssignment ornegini olusturur/bulur, id'sini dondurur.
export async function createQuizInstance(
    ctx: Context,
    userId: any,
    tenantId: any,
    stage: IAssessmentStage
): Promise<any> {
    let assignment = await ctx.service('userQuizAssignments').findOne({
        userId,
        quizSetId: stage.refId,
        tenantId,
    });
    if (!assignment) {
        assignment = await ctx.service('userQuizAssignments').create({
            userId,
            quizSetId: stage.refId,
            tenantId,
            assignedBy: userId,
            assignedAt: new Date(),
            status: 'assigned',
            attempts: 0,
            priority: 'medium',
        } as any);
    }
    return assignment._id;
}
