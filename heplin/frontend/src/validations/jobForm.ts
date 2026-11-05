import { FORM_TYPES } from 'src/constants';
import * as yup from 'yup';

const formItemKeys = Object.keys(FORM_TYPES);

const dateOrString = yup.mixed().test(
  'is-date-or-string',
  'End date must be a valid date or string',
  value => value === null || value instanceof Date || typeof value === 'string'
);

const jobGeneralInfo = {
  title: yup.string().required("titleError").min(3, "titleMinError"),
  categoryId: yup.string().required("categoryError"),
  jobType: yup.string().required("jobTypeError"),
  locationType: yup.string().required(),
  recruitmentStageId: yup.string().required(),
  country: yup.object().shape({
    names: yup.object().shape({
      en: yup.string().required(),
      tr: yup.string().required(),
    }).required(),
  }).required(),
  city: yup.string().nullable(),
  district: yup.string().nullable(),
  hiringTeams: yup.array(),
  endDate: dateOrString.nullable(),
  tenantId: yup.string().optional(),
  publishedChannels: yup.array().of(
    yup.object().shape({
      channelId: yup.string(),
      status: yup.string().oneOf(['pending', 'published', 'declined', 'draft', 'closed', 'pendingClosure']),
    })
  ).optional(),
};


const jobFields = {
  fields: yup
    .array(
      yup
        .object()
        .shape({
          type: yup.string().required(),
          isRequired: yup.boolean().required(),
          isVisible: yup.boolean().required(),
        })
        .required()
    )
    .required(),
};

const jobContent = {
  content: yup.string().required("contentError"),
};

const jobSkills = {
  skills: yup.array(yup.object().required()).required(),
};

const jobApplicantQuestions = {
  applicantForm: yup.array(
    yup.object().shape({
      type: yup.string().oneOf(formItemKeys).required('Required'),
      title: yup.string().required('Required'),
      description: yup.string().nullable(),
      options: yup.object().shape({
        expectedAnswer: yup.mixed().nullable(),
        items: yup.array(yup.string().required()).nullable(),
        isRequired: yup.boolean().required(),
      }),
    })
  ),
};

export const jobGeneralInfoSchema = yup.object().shape({
  ...jobGeneralInfo,
});

export const jobFieldsSchema = yup.object().shape({
  ...jobFields,
});

export const jobContentSchema = yup.object().shape({
  ...jobContent,
});

export const jobApplicantFormSchema = yup.object().shape({
  ...jobApplicantQuestions,
});

export const jobSkillsFormSchema = yup.object().shape({
  ...jobSkills,
});

export const jobValidationSchema = yup.object().shape({
  ...jobGeneralInfo,
  ...jobFields,
  ...jobContent,
  ...jobApplicantQuestions,
  ...jobSkills,
  //requirements: yup.string().required(),
  seoTitle: yup.string().nullable(),
  seoDescription: yup.string().nullable(),
  endDate: yup.date().nullable(),
  aiInterview: yup.string().required('Required'),

});
