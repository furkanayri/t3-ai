export type Candidate = {
    userId: string
    skills: string[]
    languageSkills: LanguageSkill[]
    isDeleted: boolean
}

export type LanguageSkill = {
    langCode: string
    level: "elementary"
    | "limitedWorking"
    | "professional"
    | "fullProfessional"
    | "nativeBilingual",
}

// export type Skill = {
//     name: string
//     slug: string
//     createdBy: string
//     isVisible: boolean
//     isDeleted: boolean
// }
