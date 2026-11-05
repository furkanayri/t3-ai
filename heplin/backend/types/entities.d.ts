import { Types, Document, PopulateOptions } from "mongoose";

export type ObjectId = Types.ObjectId | string;

export type UserStatus =
  | "active"
  | "pending"
  | "passive"
  | "frozen"
  | "deleted";

export type PaginatedResult<T> = {
  results: T[];
  count: number;
  limit: number;
  page: number;
  totalPage: number;
};

export interface IConfig extends IBase {
  key: string;
  value: any;
}

export type JobType =
  | "fulltime"
  | "parttime"
  | "contract"
  | "temporary"
  | "voluntarily"
  | "intern"
  | "other";

export type LanguageLevel =
  | "beginner"
  | "pre-intermediate"
  | "intermediate"
  | "upper-intermediate"
  | "advanced"
  | "proficiency";

export type ApplicationFormType =
  | "text"
  | "multiline"
  | "number"
  | "trueFalse"
  | "choice"
  | "multiple-choices"
  | "price";

export type IPopulateOptions =
  | string
  | string[]
  | PopulateOptions
  | PopulateOptions[];

export interface IUser extends IBase {
  phone: string;
  email: string;
  password?: string;
  googleId?: string;
  facebookId?: string;
  name?: string;
  surname?: string;
  middleName?: string;
  phone1?: string;
  phone2?: string;
  address?: string;
  district?: number;
  province?: number;
  postalCode?: string;
  preferredLanguage?: string;
  avatar?: string;
  status: UserStatus;
  lastLogin?: Date;
  registeredAt?: Date;
  recoveryCode?: string | null;
  registrationToken?: string | null;
  registrationTokenExpires?: Date | null | number;
  isAcceptedTOS?: boolean;
  isAcceptedKVKK?: boolean;
  gender?: "male" | "female" | "others";
  militaryStatus?: "completed" | "exempt" | "uncompleted";
  maritalStatus?: "married" | "single";
  identificationNumber?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isPersonaltyTest?: boolean;
  whatsappStatus: "awaiting_user_info" | "registered" | "pending_cv";
  telegramStatus: "awaiting_user_info" | "registered" | "pending_cv";
}

export interface IEmployee extends IBase {
  name?: string;
  surname?: string;
  phone?: string;
  email: string;
  address?: string;
  positionId: ObjectId;
  shiftId: ObjectId;
  userId: ObjectId;
  tenantId: ObjectId;
  type?: "employee" | "manager" | "owner" | "staff";
}
export interface IEmailTemplate extends IBase {
  title: string;
  description: string;
  message: string;
  subject: string;
  tenantId: ObjectId | ITenant;
}

export interface IDisqualifyEmailTemplate extends IBase {
  description: string;
  tenantId: ObjectId | ITenant;
}

export interface IBase extends Document {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  createdBy: ObjectId | IUser;
  updatedBy: ObjectId | IUser;
  deletedBy: ObjectId | IUser;
  isDeleted: boolean;
}

export interface ITenant extends IBase {

  name: string;
  legalName: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  subdomain: string;
  customDomain?: string;
  image?: string;
  description?: string;
  parentTenantId?: ObjectId | null | ITenant | string;
  country: string;
  city: string;
  contacts: { name: string; email?: string; phone?: string }[];
  status?: "active" | "inactive" | "pending";
  plan?: "basic" | "pro" | "enterprise";
  companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  usageQuotes?: ITenantUsageQuote[];
  logo?: string;
  senderMailAddress?: string;
  blacklistedCandidates?: [];
  tenantColor?: string;
  tenantQr?: string
}

export interface IDepartment extends IBase {
  name: string;
  image?: string;
  slug: string;
  description?: string;
  isActive: boolean;
  managers: ObjectId[] | IUser[];
  hiringTeams: ObjectId[] | IUser[];
  tenantId: ObjectId | ITenant;
}
export interface ICategories extends IBase {
  name: string;
  description?: string;
  status: "active" | "pending";
  tenantId: ObjectId | ITenant;
}
export interface ITranslations {
  tr: string;
}
export interface IState {
  id: number;
  name: string;
  state_code: string;
  type: string | null;
  cities: ICity[];
}
export interface ICity {
  id: number;
  name: string;
}
export interface ICountry extends IBase {
  id: number;
  name: string;
  phone_code: string;
  currency: string;
  region: string;
  region_id: string;
  subregion: string;
  subregion_id: string;
  translations: ITranslations;
  states: IState[];
  isVisible: boolean;
  uploadedBy: string;
}

export interface IRecruitmentStage extends IBase {
  title: string;
  description?: string;
  tenantId: ObjectId | ITenant;
  isDefault: boolean;
  isActive: boolean;
  stepsSort: ObjectId[] | IRecruitmentStageStep[];
}

export interface IRecruitmentStageStep extends IBase {
  title: string;
  description?: string;
  color?: string;
  recruitmentStageId: ObjectId | IRecruitmentStage;
  tenantId: ObjectId | ITenant;
}

export interface IRecruitmentEmailConfig extends IBase {
  title?: string;
  content?: string;
  isEmailsActive: boolean;
  emailFlow: EmailConfigFlow;
  recruitmentStageId: ObjectId | IRecruitmentStage;
  recruitmentStageStepId: ObjectId | IRecruitmentStageStep;
  tenantId: ObjectId | ITenant;
}

export type EmailConfigFlow = "auto" | "manuel";

export interface IJob extends IBase {
  title: string;
  image?: string;
  slug: string;
  content: string;
  // requirements: string;
  seoTitle: string;
  seoDescription: string;
  departmentId: ObjectId | IDepartment;
  tenantId: ObjectId | ITenant;
  categoriesId: ObjectId | ICategories;
  hiringTeams: ObjectId[] | IEmployee[];
  jobType: "fullTime" | "partTime" | "internship" | "remote";
  locationType: "onsite" | "hybrid" | "remote";
  country: string;
  city?: string;
  district?: string;
  recruitmentStageId?: ObjectId | IRecruitmentStage;
  applicantForm: {
    type: ApplicationFormType;
  }[];
  publishedChannels: {
    channelId: ObjectId;
    status:
    | "published"
    | "pending"
    | "declined"
    | "draft"
    | "pendingClosure"
    | "closed";
    lastPublishedAt: Date;
  }[];
  endDate?: Date;
  // aiInterview: "yes" | "no";
  // aiInterviewConfig?: ObjectId | IInterview;
  aiContent: "yes" | "no";
  // videoInterviewId?: ObjectId | IVideoInterview;
}

export interface ISkill extends IBase {
  name: string;
  slug: string;
  isVisible: boolean;
}
export interface IQuotas extends IBase {
  tenantId: Types.ObjectId | ITenant;
  // subscriptionId?: Types.ObjectId; // Opsiyonel olarak kullanılabilir
  email: {
    credit: number;
    remainingCredit: number;
  };
  job: {
    credit: number;
    remainingCredit: number;
  };
  jobApplications: {
    jobId: Types.ObjectId;
    totalLimit: number;
    remainingApplications: number;
  }[];
  aiFeatures: {
    interview: {
      isActive: boolean;
      maxAllowed: number;
      remainingCount: number;
    };
    videoInterview: {
      isActive: boolean;
      maxAllowed: number;
      remainingCount: number;
    },
    evaluation: {
      isActive: boolean;
      maxAllowed: number;
      remainingCount: number;
    };
  };
}

export interface ICandidate extends IBase {
  name?: string;
  surname?: string;
  email?: string;
  userId: ObjectId | IUser;
  tenantId: ObjectId | ITenant;
  skills: ObjectId[] | ISkill[];
  languageSkills: {
    langCode: string;
    level:
    | "elementary"
    | "limitedWorking"
    | "professional"
    | "fullProfessional"
    | "native";
  }[];
}

export interface ICandidateOnboarding extends IBase {
  candidateId: ObjectId | ICandidate;
  employeeId: ObjectId | IEmployee;
  tenantId: ObjectId | ITenant;
  jobId: ObjectId | IJob;
  jobApplicationId: ObjectId | IJobApplication;
  onboardingWorkflowId: ObjectId | IOnboardingworkflow;
  status: "pending" | "completed" | "cancelled" | "offerAccepted";
  responses: Array<{
    itemId: ObjectId;
    type: "text" | "file";
    title: string;
    response: any;
  }>;
  reason?: string[];
  amountAndCurrency: [
    {
      amount: number;
      currency: string;
      status: "pending" | "accepted" | "reject";
    }
  ];
}

export interface IMeeting extends IBase {
  candidateId: ObjectId | ICandidate;
  jobId: ObjectId | IJob;
  tenantId: ObjectId | ITenant;
  recruitmentStageStepId: ObjectId | IRecruitmentStageStep;
  hostId: ObjectId | IUser;
  type: "online" | "onsite" | "phone";
  notes?: string;
  privateNotes?: string;
  date: Date;
  timezone: string;
  status: "active" | "inactive" | "pending";
  IMeeting: string;
  zoomMeetingId?: string;
  attendances: ObjectId[] | IUser[];
}

export type JobApplicationStatus =
  | "applied"
  | "onBoarding"
  | "hired"
  | "cancelledByCandidate"
  | "disqualified";

export interface IJobApplication extends IBase {
  candidateId: ObjectId | string;
  userId: ObjectId;
  cv: ObjectId;
  coverLetter?: string;
  currentRecruitmentStepId: ObjectId;
  applicantAnswers: {
    questionId: ObjectId;
    answer: any;
    isMatching?: boolean;
  }[];
  jobId: ObjectId;
  tenantId: ObjectId | string;
  note?: string;
  hrNote?: string;
  disqualifyReason?: ObjectId;
  surname?: string;
  name?: string;
  employeeId?: any;
  matchingScore: number;
  onboardingId?: ObjectId;
  status: JobApplicationStatus;
  viewedBy: [{
    employeeId: ObjectId;
    start: boolean
    isSeen: boolean;
  }];
  disqualifyTimestamp: any;
  isAppliedViaWhatsapp: boolean;
  candidateScore: number;
  isAppliedViaTelegram: boolean;
}
export interface IJobApplicationWithWhatsapp extends IBase {
  userId: ObjectId;
  selectedTenantId: ObjectId,
  phone: string;
  selectedJobId: ObjectId
}

export interface ICVFile extends IBase {
  title: string;
  fileName: string;
  fileKey: string;
  uploadedBy: ObjectId | IUser;
  userId: ObjectId | IUser;
  isVisible: boolean;
  type: "media" | "logo" | "cv" | "other";
  size: number;
  contentType: string;
}

export interface ICandidateExperience extends IBase {
  userId: ObjectId | IUser;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isOngoing: boolean;
  company?: string;
  position?: string;
  jobType: JobType;
  locationType: "onsite" | "hybrid" | "remote";
  country?: {
    names: {
      en: string;
      tr: string;
    };
  };
  city?: string;
  district?: string;
  isActive: boolean;
}

export interface ICandidateEducation extends IBase {
  userId: ObjectId | IUser;
  institution: string;
  degree?: string;
  major?: string;
  startDate: Date;
  endDate?: Date;
  isOngoing: boolean;
  isActive: boolean;
}
export interface ICandidateCertificate extends IBase {
  userId: ObjectId | IUser;
  institution: string;
  degree: string;
  startDate: Date;
  endDate?: Date;
}
export interface ICandidateChat extends IBase {
  interviewId: ObjectId | IInterview;
  interviewAnswersId: ObjectId | IInterviewAnswers;
  interiewChat: Array<{
    questionId: string;
    answer: string;
    evaluateAnswer: string;
    question: string;
  }>;
}
export interface ICandidateAnswers extends IBase {
  // candidateInterviewId: ObjectId | ICandidateInterview;
  interviewId: ObjectId | IInterview;
  jobApplicationId: ObjectId | IJobApplication;
  jobId: ObjectId | IJob;
  userId: ObjectId | IUser;
  interiewAnswers: Array<{
    questionId: string;
    responseTime: number;
    fileKey: string;
    answer: string;
    evaluateAnswer: string;
    question: string;
    transcription: {
      text: String
    },
  }>;
}

export interface IInterview extends IBase {
  name: string
  description: string
  tenantId: ObjectId;
}
export interface IInterviewQuestions extends IBase {
  tenantId: ObjectId;
  interviewId: ObjectId
  questions: [
    {
      question: string
      duration: number
      audioKey: string
      evaluationCriteria?: string
      _id: ObjectId
    }
  ]
}
export interface IInterviewAutomation extends IBase {
  name: string
  tenantId: ObjectId;
  interviewList: ObjectId[] | IInterview
}
export interface IVideoInterview extends IBase {
  jobId: ObjectId;
  tenantId: ObjectId;
  interview: Array<{
    name: string;
    questions: {
      question: string;
      audioKey: string
    }[];
  }>;
}
export interface IInterviewAnswers extends IBase {
  userId: ObjectId;
  jobAppicantId: ObjectId;
  candidateId: ObjectId;
  jobId: ObjectId;
  aiInterviewId: ObjectId;
  interiewAnswers: Array<{
    questionId: string;
    answer: string;
    evaluateAnswer: string;
    question: string;
  }>;
  status: "pending" | "completed" | "expired" | "started";
  accessLocked: boolean;
  mailSent: boolean;
  expirationDate: Date;
  interviewEvaluate: {
    tr: string;
    en: string;
  };
  eventLogs: Array<{
    eventType: "copy" | "tabChange";
    questionId: string;
  }>;
  isStart: boolean;
  startDate: Date;
  interviewChatId: ObjectId;
  evaluationScore: number;
}
export interface ICandidateInterview extends IBase {
  name: string;
  userId: ObjectId;
  jobApplicantId: ObjectId;
  candidateId: ObjectId;
  jobId: ObjectId;
  candidateAnswersId: ObjectId;
  interviewId: ObjectId;
  questionIndex: number
  interviewType: "video" | "text"
  status: "pending" | "completed" | "expired" | "started";
  accessLocked: boolean;
  mailSent: boolean;
  expirationDate: Date;
  interviewEvaluate: {
    evaluation: {
      tr: [
        {
          evaluation: string;
          score: number;
          questionId: string;
        }
      ];
      en: [
        {
          evaluation: string;
          score: number;
          questionId: string;
        }
      ];
    }
    generalEvaluation: {
      tr: string;
      en: string;
    }
    totalScore: number;
  };
  eventLogs: Array<{
    eventType: "copy" | "tabChange";
    questionId: string;
  }>;
  isStart: boolean;
  startDate: Date;
  interviewChatId: ObjectId;
  evaluationScore: number;
  totalDuration: number;
  isEvaluated: boolean;
}
interface IVideoInterviewAnswerSave extends IBase {
  userId: Types.ObjectId;
  jobApplicantId: Types.ObjectId;
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  videoInterviewAnswerId: Types.ObjectId;
  fileKey: String
  question: String
  questionId: String
  transcription:
  {
    text: String
  },
  isEvaluated: Boolean
}
export interface IVideoInterviewAnswers extends IBase {
  userId: ObjectId;
  jobAppicantId: ObjectId;
  candidateId: ObjectId;
  jobId: ObjectId;
  aiInterviewId: ObjectId;
  interiewAnswers: Array<{
    questionId: string;
    answer: string;
    evaluateAnswer: string;
    question: string;
  }>;
  status: "pending" | "completed" | "expired" | "started";
  accessLocked: boolean;
  mailSent: boolean;
  expirationDate: Date;
  interviewEvaluate: {
    tr: string;
    en: string;
  };
  eventLogs: Array<{
    eventType: "copy" | "tabChange";
    questionId: string;
  }>;
  isStart: boolean;
  startDate: Date;
  interviewChatId: ObjectId;
  evaluationScore: number;
}

export interface ICandidateLanguage extends IBase {
  candidateId: ObjectId;
  userId: ObjectId | IUser;
  name: string;
  languageLevel: LanguageLevel;
}

export interface ICandidateSkill extends IBase {
  userId: ObjectId | IUser;
  skills: ObjectId[] | ISkill[];
}

export interface ICandidateEvaluation extends IBase {
  candidateId: ObjectId | ICandidate;
  employeeId: ObjectId | IEmployee;
  jobId: ObjectId;
  recruitmentStepId: ObjectId;
  note?: string;
  evaluationTemplateId: ObjectId;
  score: number;
  scoreCard: Array<{
    itemId: ObjectId;
    score: "no" | "not-sure" | "yes" | "strong-yes";
  }>;
  fields: Array<{
    fieldId: ObjectId;
    answer: string;
  }>;
}

export interface IEvaluationTemplate extends IBase {
  title: string;
  scoreCards: { title: string; description?: string }[];
  fields: { title: string; description?: string; type: "multiline" }[];
  isActive: Boolean;
}

export interface ICandidateComment extends IBase {
  content: string;
  createdBy: ObjectId | IUser;
  candidateId: ObjectId | ICandidate;
  replyId?: ObjectId | ICandidateComment;
  tenantId: ObjectId | ITenant;
  replyCount: number;
}
export interface IOnboardingworkflow extends IBase {
  title: string;
  description?: string;
  items: {
    type: "text" | "file";
    title: string;
    description?: string;
  }[];
  tenantId: ObjectId | ITenant;
}

export interface IOnboardingResponse extends IBase {
  items: {
    itemId: ObjectId;
    type: "text" | "file";
    title: string;
    response?: any;
  };
  onboardingWorkflowId: ObjectId | IOnboardingworkflow;
  employeeId: ObjectId | IEmployee;
  tenantId: ObjectId | ITenant;
  status: "pending" | "accepted" | "declined";
}
export interface IMail extends IBase {
  parsedFromS3Key: string;
  parsedDate: Date;
  date: Date;
  from?: {
    name?: string;
    address?: string;
    text?: string;
  };
  to?: {
    name?: string;
    address?: string;
    text?: string;
  }[];
  cc?: Array<{
    name: string;
    address: string;
  }>;
  bcc?: Array<{
    name: string;
    address: string;
  }>;
  subject: string;
  text?: string;
  html: string;
  isSeen?: boolean;
  isArchived?: boolean;
  attachments?: Array<{
    filename: string;
    filekey: string;
    size: number;
  }>;
  threadId: string;
}

interface IExperience extends Document {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isOngoing: boolean;
  company: string;
  position: string;
  jobType: string;
  country: string;
  city: string;
  district: string;
  locationType: string;
}

interface IEducation extends Document {
  institution: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  isOngoing: boolean;
  isActive: boolean;
  description: string;
}

interface ICertificate extends Document {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface ILanguage extends Document {
  name: string;
  languageLevel: string;
}

interface ISkill extends Document {
  name: string;
  slug: string;
}

interface IContactInformation extends Document {
  email: string;
  address: string;
  githubUrl: string;
  linkedinUrl: string;
  phoneNumber: string;
  birthDay: string;
  name: string;
  surname: string;
}

interface IReferenceContact extends Document {
  email: string;
  phoneNumber: string;
}

interface IReference extends Document {
  name: string;
  description: string;
  contact: IReferenceContact[];
}

export interface ICV extends Document {
  userId: ObjectId;
  cvId: ObjectId;
  experience: IExperience[];
  education: IEducation[];
  certificates: ICertificate[];
  languages: ILanguage[];
  skills: ISkill[];
  coverLetter: string;
  contactInformation: IContactInformation;
  reference: IReference[];
}
interface AiPrompt extends IBase {
  candidateId: ObjectId | string;
  jobId: ObjectId | string;
  tenantId: ObjectId;
  jobApplicationId: ObjectId;
  candidateScore: number;
  candidateStrengths: {
    strength: { tr: string; en: string };
    description: { tr: string; en: string };
  }[];
  candidateMissing: {
    skill: { tr: string; en: string };
    description: { tr: string; en: string };
  }[];
  summary?: { tr: string; en: string };
  improvementSuggestions?: { tr: string; en: string }[];
}

interface ArchiveAiPrompt extends IBase {
  candidateId: ObjectId;
  jobId: ObjectId;
  tenantId: ObjectId;
  jobApplicationId: ObjectId;
  candidateScore: number;
  candidateStrengths: {
    strength: { tr: string; en: string };
    description: { tr: string; en: string };
  }[];
  candidateMissing: {
    skill: { tr: string; en: string };
    description: { tr: string; en: string };
  }[];
  summary?: { tr: string; en: string };
  improvementSuggestions?: { tr: string; en: string }[];
}

export interface ITenantUsageQuote extends IBase {
  type: "sms" | "email";
  remainingFreeCredit: {
    credit: number;
    expires?: Date;
  };
  remainingPurchasedCredit: {
    credit: number;
    expires?: Date;
  };
  remainingTotalCredit: {
    credit: number;
  };
}

export interface ITenantUsageQuoteLogs extends IBase {
  tenantId: ObjectId | ITenant;
  credit?: number;
  type?: "sms" | "email";
  message?: string;
  taskType?: string; //TODO: Add enum
  sender?: string;
  recipient?: string;
}

export interface ITenantMember extends IBase {
  userId: ObjectId | IUser;
  tenantId: ObjectId | ITenant;
  roleId: "admin" | "editor" | "candidate";
  status: "active" | "inactive" | "pending";
}

export type IPostingChannelType =
  | "linkedin"
  | "kariyernet"
  | "indeed"
  | "careerpage"
  | "jobportalpage"
  | "connection"
  | "districtgovernorate";

export type IPostingChannelStatus = "active" | "inactive" | "pending";

export interface IPostingChannel extends IBase {
  name: String;
  tenantId: ObjectId | ITenant;
  domain?: string;
  subdomain?: string;
  connectionChannelId?: ObjectId;
  type: IPostingChannelType;
  status: IPostingChannelStatus;
  isOwner: boolean;
}

export interface IPermission extends IBase {
  userId: ObjectId | IUser;
  scope: string;
  resource: any;
  allowed: boolean;
}

export interface IPersonalityTestResult extends IBase {
  userId: ObjectId | IUser;
  perfectionism: number;
  ambition: number;
  motivation: number;
  desireForLeadership: number;
  strengths: {
    tr: string[];
    en: string[];
  };
  weaknesses: {
    tr: string[];
    en: string[];
  };
}

export interface IAccessToken extends IBase {
  accessKeyId: string;
  accessSecretKey: string;
}

export interface INotification extends IBase {
  userId: ObjectId | IUser;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
}

export interface ICandidateBlackList extends IBase {
  userId: ObjectId | IUser;
  candidateId: ObjectId | ICandidate;
  tenantId: ObjectId | ITenant;
  jobId: ObjectId | IJob;
  reason: string;
  isRemoveBlackList: boolean;
  jobApplicationId: ObjectId | IJobApplication;
}

export interface ICandidateArchive extends IBase {
  phone: string;
  email?: string;
  password?: string;
  googleId?: string;
  facebookId?: string;
  name?: string;
  surname?: string;
  address?: string;
  district?: number;
  province?: number;
  preferredLanguage?: string;
  avatar?: string;
  status: UserStatus;
  tenantId: ObjectId | ITenant;
  skills: ObjectId[] | ISkill[] | string[];
  lastLogin?: Date;
  registeredAt?: Date;
  recoveryCode?: string | null;
  registrationToken?: string | null;
  registrationTokenExpires?: Date | null | number;
  isAcceptedTOS?: boolean;
  isAcceptedKVKK?: boolean;
  gender?: "male" | "female" | "others";
  militaryStatus?: "completed" | "exempt" | "uncompleted";
  maritalStatus?: "married" | "single";
  identificationNumber?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

}

export interface IJobApplicationsArchives extends IBase {
  candidateId: ObjectId | string;
  userId: ObjectId;
  cv: ObjectId;
  coverLetter?: string;
  currentRecruitmentStepId: ObjectId;
  applicantAnswers: {
    questionId: ObjectId;
    answer: any;
    isMatching?: boolean;
  }[];
  jobId: ObjectId;
  tenantId: ObjectId | string;
  note?: string;
  hrNote?: string;
  disqualifyReason?: ObjectId;
  surname?: string;
  name?: string;
  employeeId?: any;
  matchingScore: number;
  onboardingId?: ObjectId;
  status: JobApplicationStatus;
  viewedBy: [ObjectId];
  disqualifyTimestamp: any;
  isAppliedViaWhatsapp: boolean;
  candidateScore: number;
  isAppliedViaTelegram: boolean;
}
export interface IArchiveJobs extends IBase {
  title: string;
  image?: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  departmentId: ObjectId | IDepartment;
  tenantId: ObjectId | ITenant;
  categoriesId: ObjectId | ICategories;
  jobType: "fullTime" | "partTime" | "internship" | "remote";
  locationType: "onsite" | "hybrid" | "remote";
  country: string;
  city?: string;
  district?: string;
  aiContent: "yes" | "no";
}

