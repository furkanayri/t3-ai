import { Education } from "src/types";
//  type: "Bachelors" | "Masters" | "PhD" | "Diploma" | "Certificate" | "Bootcamp" | "Course" | "Other"

export const educations: Education[] = [
  {
    institution: "Orta Doğu Teknik Üniversitesi",
    degree: "Bachelor of Science",
    major: "Computer Science",
    startDate: new Date(),
    endDate: new Date(),
    isOngoing: true,
  },
  {
    institution: "Another University",
    degree: "Master of Business Administration",
    major: "Marketing",
    startDate: new Date(),
    endDate: new Date(),
    isOngoing: false,
  },
  {
    institution: "Yet Another College",
    degree: "Associate of Arts",
    major: "English Literature",
    startDate: new Date(),
    endDate: new Date(),
    isOngoing: false,
  },
];