import { z } from "zod";
const CandidateLanguageSchema = z.object({
  name: z.string(),
  languageLevel: z.enum([
    "beginner",
    "pre-intermediate",
    "intermediate",
    "upper-intermediate",
    "advanced",
    "proficiency",
  ]),
});

const CandidateExperienceSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  isOngoing: z.boolean(),
  company: z.string().optional(),
  position: z.string().optional(),
  jobType: z.enum([
    "fulltime",
    "parttime",
    "contract",
    "temporary",
    "voluntarily",
    "intern",
    "other",
  ]).optional(),
  locationType: z.enum(["onsite", "hybrid", "remote"]),
  country: z.object({
    names: z.object({
      en: z.string().optional(),
      tr: z.string().optional(),
    })
  }).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const CandidateEducationSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  major: z.string().optional(),
  startDate: z.string().optional().refine((date) => {
    return !date || !isNaN(Date.parse(date));
  }, {
    message: "Invalid startDate format. Expected format is YYYY-MM-DD."
  }),
  endDate: z.string().optional().refine((date) => {
    return !date || !isNaN(Date.parse(date));
  }, {
    message: "Invalid endDate format. Expected format is YYYY-MM-DD."
  }),
  isOngoing: z.boolean(),
  isActive: z.boolean(),
});
const CandidateCertificateSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  startDate: z.string().optional().refine((date) => {
    return !date || !isNaN(Date.parse(date));
  }, {
    message: "Invalid startDate format. Expected format is YYYY-MM-DD."
  }),
  endDate: z.string().optional().refine((date) => {
    return !date || !isNaN(Date.parse(date));
  }, {
    message: "Invalid endDate format. Expected format is YYYY-MM-DD."
  }),
});
const ContactInformationSchema = z.object({
  name: z.string(),
  surname: z.string(),
  email: z.string(),
  address: z.string(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  phoneNumber: z.string(),
  birthDay: z.string().optional(),
});

const ReferenceSchema = z.array(
  z.object({
    name: z.string(),
    description: z.string(),
    contact: z.array(
      z.object({
        email: z.string(),
        phoneNumber: z.string(),
      })
    ),
  })
);

const CoverLetterSchema = z.string();
const SkillsSchema = z.object({
  name: z.string(),
  slug: z.string(),
});


export const CombinedSchema = z.object({
  languages: z.array(CandidateLanguageSchema),
  skills: z.array(SkillsSchema),
  experience: z.array(CandidateExperienceSchema),
  education: z.array(CandidateEducationSchema),
  certificates: z.array(CandidateCertificateSchema),
  contactInformation: ContactInformationSchema,
  reference: ReferenceSchema,
  coverLetter: CoverLetterSchema,
});
export type IPdfType = z.infer<typeof CombinedSchema>;