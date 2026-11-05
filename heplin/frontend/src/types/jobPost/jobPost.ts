import {
  jobApplicantFormSchema,
  jobContentSchema,
  jobFieldsSchema,
  jobGeneralInfoSchema,
  jobSkillsFormSchema,
  jobValidationSchema,
} from 'src/validations';
import { archiveJobValidationSchema } from 'src/validations/archiveJobForm';

export type JobPostStatus = 'active' | 'closed' | 'archived';

type JobStatusExtra = 'delete' | 'duplicate';
export type JobStatusAction = JobPostStatus | JobStatusExtra;

export type JobTogglePublish = {
  action: "publish" | "unpublish",
  channelId: string
}

export type FormType =
  | 'text'
  | 'multiline'
  | 'number'
  | 'price'
  //| 'video-answer' TODO: implement next version
  | 'trueFalse'
  | 'multiple-choices'
  | 'choice';

export type ApplicantFormItem = {
  type: FormType;
  title: string;
  description?: string;
  options: {
    isRequired: boolean;
    items?: string[];
    currency?: string;
    expectedAnswer?: any;
  };
};

export type JobPostType =
  | 'fulltime'
  | 'parttime'
  | 'contract'
  | 'temporary'
  | 'voluntarily'
  | 'intern'
  | 'other';

export type JobPost = {
  _id: string;
  title: string;
  image: string | null;
  slug: string;
  content: string;
  skills: string[];
  createdBy: string;
  seoTitle: string;
  seoDescription: string;
  categoryId?: string | any;
  recruitmentStageId?: string | any;
  companyId: string;
  tenantId: string;
  hiringTeams: string[];
  applicantForm: ApplicantFormItem[];
  status: JobPostStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  jobType: JobPostType;
  locationType: 'remote' | 'onsite' | 'hybrid';
  fields: Array<{ type: string; isRequired: boolean; isVisible: boolean }>;
  country: {
    _id: string;
    names: { [key: string]: string };
  };
  city: string;
  disctrict: string;
  endDate: Date;
  applicantId?: string;
  employeeId?: string;
  publishedChannels: JobPostingChannel[]
  applicationNumber: number;
  viewNumber: number;
};
export type ArchiveJobPost = {
  _id: string;
  title: string;
  image: string | null;
  slug: string;
  content: string;
  skills: string[];
  createdBy: string;
  seoTitle: string;
  seoDescription: string;
  categoryId?: string | any;
  recruitmentStageId?: string | any;
  companyId: string;
  tenantId: string;
  hiringTeams: string[];
  applicantForm: ApplicantFormItem[];
  status: JobPostStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  jobType: JobPostType;
  locationType: 'remote' | 'onsite' | 'hybrid';
  fields: Array<{ type: string; isRequired: boolean; isVisible: boolean }>;
  country: {
    _id: string;
    names: { [key: string]: string };
  };
  city: string;
  disctrict: string;
  endDate: Date;
  applicantId?: string;
  employeeId?: string;
  publishedChannels: JobPostingChannel[]
  applicationNumber: number;
  viewNumber: number;
};

export type JobPostingChannel = {
  channelId: string;
  status: JobPostChannelStatus;
  _id: string;
  lastPublishedAt?: Date;
}

export type JobPostChannelStatus = "published" | "pending" | "declined" | "draft" | "pendingClosure" | "closed";

export type JobForm = typeof jobValidationSchema.__outputType;
export type ArchiveJobForm = typeof archiveJobValidationSchema.__outputType;

export type JobGeneralInfoForm = typeof jobGeneralInfoSchema.__outputType;

export type JobFormFields = typeof jobFieldsSchema.__outputType;

export type JobDescriptionForm = typeof jobContentSchema.__outputType;

export type JobApplicantQuestionForm = typeof jobApplicantFormSchema.__outputType;

export type JobSkillsForm = typeof jobSkillsFormSchema.__outputType;

export type UpdateJobApplicationEmployeePayload = {
  applicantId: string,
  newEmployeeId: string,
  currentEmployeeId: string
}

export type PopulatedJobPost = JobPost & { tenant: any }
