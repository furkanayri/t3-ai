export default async function jsontoAutoFillTelegram(ctx: Context, cvId: string, userId: string) {

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
                        startDate: item.startDate || new Date(),
                        endDate: item.endDate || new Date(),
                        isOngoing: item.isOngoing,
                        company: item.company,
                        jobType: 'other',
                        locationType: 'onsite',
                        country: item.country,
                        city: item.city,
                        district: item.district,
                        isActive: item.isActive
                    })
                }
                if (type === "education") {
                    const education = await ctx.service(serviceName).create({
                        userId: userId,
                        institution: item.institution,
                        degree: item.degree,
                        major: item.major,
                        startDate: item.startDate || new Date(),
                        endDate: item.endDate || new Date(),
                        isOngoing: item.isOngoing,
                        isActive: item.isActive
                    })
                }
                if (type === "certificates") {
                    const certificates = await ctx.service(serviceName).create({
                        userId: userId,
                        institution: item.institution,
                        degree: item.degree,
                        startDate: item.startDate || new Date(),
                        endDate: item.endDate || new Date()
                    })

                }
                if (type === "languages") {
                    const languages = await ctx.service(serviceName).create({
                        userId: userId,
                        name: item.name,
                        languageLevel: item.languageLevel
                    })
                }

            })
        )
        return val ? true : false
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
    return isSuccess

}