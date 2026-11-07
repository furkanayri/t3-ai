function normalizeDate(dateStr) {
    if (!dateStr) return new Date();

    if (dateStr instanceof Date) return dateStr;

    const mmyyyyRegex = /^(\d{1,2})\/(\d{4})$/;
    if (typeof dateStr === 'string' && mmyyyyRegex.test(dateStr)) {
        const [, month, year] = mmyyyyRegex.exec(dateStr);
        return new Date(parseInt(year), parseInt(month) - 1, 1);
    }

    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
    }

    return new Date();
}

export default async function jsontoAutoFill(ctx: Context) {

    const cvId = ctx.state.cvId
    const userId = ctx.state.user?._id
    const data = await ctx.service('candidateCv').findOne({
        _id: cvId
    })

    let isSuccess = {
        education: false,
        experience: false,
        certificates: false,
        languages: false
    }

    async function handleAutoFill(data, serviceName, type) {
        const val = await Promise.all(
            data?.map(async (item) => {
                if (type === "experience") {
                    const experience = await ctx.service(serviceName).create({
                        userId: userId,
                        title: item.title,
                        description: item.description,
                        startDate: normalizeDate(item.startDate),
                        endDate: item.isOngoing ? undefined : normalizeDate(item.endDate),
                        isOngoing: item.isOngoing,
                        company: item.company,
                        jobType: 'other',
                        locationType: 'onsite',
                        country: item.country,
                        city: item.city,
                        district: item.district,
                        isActive: item.isActive
                    })
                    return experience;
                }
                if (type === "education") {
                    const education = await ctx.service(serviceName).create({
                        userId: userId,
                        institution: item.institution,
                        degree: item.degree,
                        major: item.major,
                        startDate: normalizeDate(item.startDate),
                        endDate: item.isOngoing ? undefined : normalizeDate(item.endDate),
                        isOngoing: item.isOngoing,
                        isActive: item.isActive
                    })
                    return education;
                }
                if (type === "certificates") {
                    const certificates = await ctx.service(serviceName).create({
                        userId: userId,
                        institution: item.institution,
                        degree: item.degree,
                        startDate: normalizeDate(item.startDate),
                        endDate: normalizeDate(item.endDate)
                    })
                    return certificates;
                }
                if (type === "languages") {
                    const languages = await ctx.service(serviceName).create({
                        userId: userId,
                        name: item.name,
                        languageLevel: item.languageLevel
                    })
                    return languages;
                }
            })
        )
        return val?.length > 0;
    }


    if (data.experience.length > 0) {
        isSuccess.experience = await handleAutoFill(data.experience, "candidateExperiences", "experience")
    }

    if (data.education.length > 0) {
        isSuccess.education = await handleAutoFill(data.education, "candidateEducations", "education")
    }
    if (data.certificates.length > 0) {
        isSuccess.certificates = await handleAutoFill(data.certificates, "candidateCertificates", "certificates")
    }
    if (data.languages.length > 0) {
        isSuccess.languages = await handleAutoFill(data.languages, "candidateLanguages", "languages")
    }

    ctx.body = { isSuccess }

}