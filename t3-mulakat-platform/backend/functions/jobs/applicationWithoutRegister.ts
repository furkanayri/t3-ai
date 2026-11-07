import { Types } from "mongoose";
import { spendJobApplicationCredit } from "../quotas/utils";
import { array } from "@/utils";
import { start } from "repl";

function normalizeDate(dateStr: any): Date {
    // 1) Eğer hiç tarih yoksa, bugünün tarihini döndür
    if (!dateStr) return new Date();

    // 2) Eğer zaten Date nesnesiyse doğrudan iade et
    if (dateStr instanceof Date) return dateStr;

    // 3) "MM/YYYY" formatını yakalayalım
    const mmyyyyRegex = /^(\d{1,2})\/(\d{4})$/;
    if (typeof dateStr === "string" && mmyyyyRegex.test(dateStr)) {
        const [, month, year] = mmyyyyRegex.exec(dateStr);
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    }

    // 4) Doğrudan Date parse etmeyi deneyelim
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
    }

    // 5) Hiçbir koşula uymuyorsa bugünün tarihini dönüyoruz
    return new Date();
}

export default async function applicationWithoutRegister(ctx: Context) {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        experience,
        education,
        languages,
        skills,
        jobId,
        cvId,
        coverLetter,
        certificates,
    } = ctx.request.body;

    if (!email || !jobId) {
        return ctx.throw(404, "User or Email not found");
    }


    const applicantAnswers = array<any>(ctx.request.body.applicantAnswers);

    let user = await ctx.service('users').findOne({ email });

    if (!user) {
        user = await ctx.service('users').create({
            name: firstName,
            surname: lastName,
            email,
            phone: phoneNumber,
        });
    }

    const userID =
        user._id instanceof Types.ObjectId
            ? user._id
            : (user._id as any)?._id;


    const job = await ctx.service('jobs').findOne({
        _id: jobId
    })


    if (!job) {
        return ctx.throw(404, "Job not found");
    }

    const jobID =
        job._id instanceof Types.ObjectId
            ? job._id
            : (job._id as any)?._id;


    let candidate = await ctx.service('candidates').findOne({
        userId: userID,
        tenantId: job.tenantId,
    });
    const candidateID =
        job._id instanceof Types.ObjectId
            ? job._id
            : (job._id as any)?._id;

    if (candidate) {
        const candidateID =
            candidate._id instanceof Types.ObjectId
                ? candidate._id
                : (candidate._id as any)?._id;


        await ctx.service("candidateExperiences").deleteMany(userID);
        await ctx.service("candidateEducations").deleteMany(userID);
        await ctx.service("candidateCertificates").deleteMany(userID);
        await ctx.service("candidateLanguages").deleteMany(userID);
        //TODO: MAYBE DELETE SKILLS
        await ctx.service("candidates").update(candidateID, {
            name: firstName,
            surname: lastName,
            email,
        });
    } else {

        candidate = await ctx.service("candidates").create({
            userId: userID,
            tenantId: job.tenantId,
            name: firstName,
            surname: lastName,
            email,
        });
    }

    // Skills
    if (skills && Array.isArray(skills) && skills.length > 0) {
        const skillIds = await Promise.all(
            skills.map(async (skill: any) => {
                let existingSkill = await ctx.service("skills").findOne({ slug: skill.slug });
                if (existingSkill) {
                    return existingSkill._id;
                } else {
                    const newSkill = await ctx.service("skills").create({
                        name: skill.name,
                        slug: skill.slug,
                    });
                    return newSkill._id;
                }
            })
        );

        let candidateSkill = await ctx.service("candidateSkills").findOne({
            userId: user.id,
        });

        const candidateSkillID =
            candidateSkill?._id instanceof Types.ObjectId
                ? candidateSkill?._id
                : (candidateSkill?._id as any)?._id;

        if (candidateSkill) {
            await ctx.service("candidateSkills").update(candidateSkillID, {
                skills: skillIds,
            });
        } else {
            candidateSkill = await ctx.service("candidateSkills").create({
                skills: skillIds,
                userId: user?.id,
            });
        }
    }

    // Languages
    if (languages && Array.isArray(languages) && languages.length > 0) {
        await Promise.all(
            languages.map(async (language: any) => {
                let candidateLanguage = await ctx.service("candidateLanguages").findOne({
                    userId: user.id,
                    name: language.name,
                });
                const candidateLanguageID =
                    candidateLanguage?._id instanceof Types.ObjectId
                        ? candidateLanguage?._id
                        : (candidateLanguage?._id as any)?._id;

                if (candidateLanguage) {
                    await ctx.service("candidateLanguages").update(candidateLanguageID, {
                        languageLevel: language.languageLevel,
                    });
                } else {
                    await ctx.service("candidateLanguages").create({
                        userId: user.id,
                        candidateId: candidate.id,
                        name: language.name,
                        languageLevel: language.languageLevel,
                    });
                }
            })
        );
    }

    // Educations
    if (education && Array.isArray(education) && education.length > 0) {
        await Promise.all(
            education.map(async (edu: any) => {
                let candidateEducation = await ctx.service("candidateEducations").findOne({
                    userId: user.id,
                    institution: edu.institution,
                });
                const candidateEducationID =
                    candidateEducation?._id instanceof Types.ObjectId
                        ? candidateEducation?._id
                        : (candidateEducation?._id as any)?._id;

                if (candidateEducation) {
                    await ctx.service("candidateEducations").update(candidateEducationID, {
                        major: edu.major,
                        endDate: edu.endDate ? normalizeDate(edu.endDate) : undefined,
                        isOngoing: edu.isOngoing,
                        isActive: edu.isActive,
                    });
                } else {
                    await ctx.service("candidateEducations").create({
                        userId: user.id,
                        institution: edu.institution,
                        degree: edu.degree,
                        major: edu.major,
                        startDate: normalizeDate(edu.startDate),
                        endDate: edu.endDate ? normalizeDate(edu.endDate) : undefined,
                        isOngoing: edu.isOngoing,
                        isActive: edu.isActive,
                    });
                }
            })
        );
    }

    // Experience
    if (experience && Array.isArray(experience) && experience.length > 0) {
        await Promise.all(
            experience.map(async (exp: any) => {
                let candidateExperience = await ctx.service("candidateExperiences").findOne({
                    userId: user._id,
                    title: exp.title,
                    company: exp.company,
                });
                const candidateExperienceID =
                    candidateExperience?._id instanceof Types.ObjectId
                        ? candidateExperience?._id
                        : (candidateExperience?._id as any)?._id;

                if (candidateExperience) {
                    await ctx.service("candidateExperiences").update(candidateExperienceID, {
                        description: exp.description,
                        endDate: exp.endDate ? normalizeDate(exp.endDate) : undefined,
                        isOngoing: exp.isOngoing,
                        position: exp.position,
                        jobType: exp.jobType,
                        locationType: exp.locationType,
                        country: exp.country,
                        city: exp.city,
                        district: exp.district,
                        isActive: exp.isActive,
                    });
                } else {
                    await ctx.service("candidateExperiences").create({
                        userId: userID,
                        title: exp.title,
                        description: exp.description,
                        startDate: normalizeDate(exp.startDate),
                        endDate: exp.endDate ? normalizeDate(exp.endDate) : undefined,
                        isOngoing: exp.isOngoing,
                        company: exp.company,
                        position: exp.position,
                        jobType: exp.jobType,
                        locationType: exp.locationType,
                        country: exp.country,
                        city: exp.city,
                        district: exp.district,
                        isActive: exp.isActive,
                    });
                }
            })
        );
    }

    // Certificates
    if (certificates && Array.isArray(certificates) && certificates.length > 0) {
        await Promise.all(
            certificates.map(async (cert: any) => {
                let candidateCertificate = await ctx.service("candidateCertificates").findOne({
                    userId: user._id,
                    institution: cert.institution,
                    degree: cert.degree,
                    startDate: cert.startDate ? normalizeDate(cert.startDate) : undefined,
                });
                const candidateCertificateID =
                    candidateCertificate?._id instanceof Types.ObjectId
                        ? candidateCertificate?._id
                        : (candidateCertificate?._id as any)?._id;

                if (candidateCertificate) {
                    await ctx.service("candidateCertificates").update(candidateCertificateID, {
                        endDate: cert.endDate ? normalizeDate(cert.endDate) : undefined,
                        isOngoing: cert.isOngoing,
                        isActive: cert.isActive,
                    });
                } else {
                    const newCertificate = {
                        userId: userID,
                        institution: cert.institution,
                        degree: cert.degree,
                        startDate: cert.startDate ? normalizeDate(cert.startDate) : undefined,
                        endDate: cert.endDate ? normalizeDate(cert.endDate) : undefined,
                    };
                    await ctx.service("candidateCertificates").create(newCertificate);
                }
            })
        );
    }

    applicantAnswers
    const jobQuestions = array<any>(job.applicantForm);
    const calculatedApplicantAnswers = jobQuestions.map((question) => {
        const result = applicantAnswers.find((applicantAnswer) => {
            return (
                applicantAnswer?.questionId?.toString() === question._id.toString()
            );
        });

        const answer = result?.answer;

        let isMatching = undefined;

        if (question.options?.expectedAnswer) {
            switch (question.type) {
                case "trueFalse":
                    answer?.toString() === question?.options?.expectedAnswer
                        ? (isMatching = true)
                        : (isMatching = false);
                    break;
                case "choice":
                    question?.options?.expectedAnswer?.includes(answer)
                        ? (isMatching = true)
                        : (isMatching = false);
                    break;
                case "multipleChoice":
                    question?.options?.expectedAnswer?.includes(answer)
                        ? (isMatching = true)
                        : (isMatching = false);
                    break;
                case "price":
                    if (
                        answer <=
                        Math.max(
                            question.options?.expectedAnswer?.min,
                            question.options?.expectedAnswer?.max
                        )
                    ) {
                        isMatching = true;
                    }
                    break;
                default:
                    break;
            }
        }

        return {
            questionId: question._id,
            answer,
            isMatching,
        };
    });

    const hasExpectedAnswersLength = jobQuestions.filter(
        (a) => a.options?.expectedAnswer
    ).length;

    const matchingScore =
        hasExpectedAnswersLength > 0
            ? (calculatedApplicantAnswers.filter((answer) => answer.isMatching)
                .length /
                hasExpectedAnswersLength) *
            100
            : 0;


    const employeeApplicationCounts = await Promise.all(
        job.hiringTeams.map(async (employeeId) => {
            const count = await ctx.service("jobApplications").count({
                jobId,
                employeeId,
            });
            return { employeeId, count };
        })
    );

    let leastAssignedEmployee = employeeApplicationCounts[0];
    for (const employee of employeeApplicationCounts) {
        if (employee.count < leastAssignedEmployee.count) {
            leastAssignedEmployee = employee;
        }
    }

    const employeeId = leastAssignedEmployee.employeeId;
    const existingJobApplication = await ctx.service('jobApplications').findOne({
        candidateId: candidate._id,
        jobId: jobID,
    });

    if (existingJobApplication) {
        return ctx.throw(400, "Job application already exists for this job.");
    }

    const tenantId =
        job.tenantId instanceof Types.ObjectId
            ? job.tenantId
            : (job.tenantId as any)?._id;


    if (!user._id || (typeof tenantId !== 'string' && !(tenantId instanceof Types.ObjectId)))
        ctx.throw(404, "Invalid user id");



    const recruitmentStage = await ctx.service("recruitmentStages").findOne({
        _id: job.recruitmentStageId,
    });
    if (!recruitmentStage) {
        return ctx.throw(404, "Recruitment stage not found");
    }

    if (recruitmentStage.stepsSort.length <= 0) {
        return ctx.throw(404, "Recruitment stage steps not found");
    }

    const step = recruitmentStage.stepsSort[0];
    const cv = await ctx
        .service("cv")
        .findOne({ _id: cvId, });

    if (!cv?._id || (typeof cv?._id !== 'string' && !(cv?._id instanceof Types.ObjectId)))
        ctx.throw(404, "Cv not found");



    const jobApplication = await ctx.service('jobApplications').create({
        coverLetter: coverLetter,
        candidateId: candidate.id,
        userId: user.id,
        jobId: jobID,
        tenantId: tenantId,
        currentRecruitmentStepId:
            step instanceof Types.ObjectId ? step : ((step as any)?._id as any),
        name: firstName,
        surname: lastName,
        cv: cv._id,
        applicantAnswers: calculatedApplicantAnswers,
        employeeId,

    });

    ctx.state.tenantId = tenantId;//for quota control
    ctx.state.jobId = jobID;//for quota control
    ctx.state.jobApplication = jobApplication;
    ctx.state.cv = cv;

    await spendJobApplicationCredit(ctx, jobID, tenantId, 1)
    ctx.body = {
        success: true,
        userId: user.id,
        candidateId: candidate.id,
        jobApplicationId: jobApplication.id,

    };


}
