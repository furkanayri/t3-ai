import UsersService from "./users";
import JobsService from "./jobs";
import DepartmentsService from "./departments";
import CategoryService from "./categories";
import RecruitmentStagesService from "./recruitmentStages";
import RecruitmentStageStepsService from "./recruitmentStageSteps";
import RecruitmentEmailConfigsService from "./recruitmentEmailConfigs";
import SkillsService from "./skills";
import MeetingsService from "./meetings";
import ConfigsService from "./configs"
import JobApplicationsService from "./jobApplications";
import JobApplicationsArchivesService from "./jobApplicationsArchives";
import CandidatesService from "./candidates"
import CVService from "./cv"
import CandidateExperiencesService from "./candidateExperiences"
import CandidateEducationsService from "./candidateEducations"
import CandidateLanguagesService from "./candidateLanguages"
import CandidateSkillsService from "./candidateSkills"
import CandidateCertificatesService from "./candidateCertificates"
import CandidateCommentsService from "./candidateComments"
import OnboardingworkflowsService from "./onboardingworkflow";
import EmployeesService from "./employees"
import OnboardingResponseService from "./onboardingresponses";
import MailsService from "./mail";
import CandidateCvtoJsonService from "./candidateCvtoJson";
import AiEvaluationService from "./aiEvaluation";
import ArchiveAiEvaluationService from "./archiveAiEvaluation";
import CandidateEvaluationsService from "./candidateEvaluations";
import EvaluationTemplatesService from "./evaluationTemplates";
import CandidateOnboardingsService from "./candidateOnboardings";
import EmailTemplatesService from './emailTemplates'
import DisqualifyEmailTemplatesService from './disqualifyEmailTemplates'
import PermissionsService from "./permissions";
import PostingChannelsService from "./postingChannels";
import TenantMembersService from "./tenantMembers";
import TenantsService from "./tenants";
import TenantUsageQuoteLogsService from "./tenantUsageQuoteLogs";
import NotificatonService from "./notifications"
import CountriesService from './countries'
import PersonalityTestService from './personalTest'
import AiInterviewService from './interview'
import AiInterviewAnswersService from './interviewAnswers'
import CandidateChatService from './candidateChat'
import JobApplicationsWithWhatsappService from './jobApplicationsWithWhatsapp'
import QuotasService from './quotas'
import CandidateBlackListsService from "./candidatesBlackLists";
import InterviewQuestionsService from './interviewQuestions'
import CandidateInterviewService from './candidateInterview'
import CandidateInterviewAnswersService from "./candidateAnswers";
import InterviewAutomationService from "./interviewautomation";
import QuizQuestionsService from "./quizQuestions";
import QuizSetsService from "./quizSets";
import UserQuizAssignmentsService from "./userQuizAssignments";
import QuizSessionsService from "./quizSessions";
import UserQuizAnswersService from "./userQuizAnswers";
import CandidateArchivesService from "./candidateArchives";
import ArchiveJobsService from "./archivesJobs";
import PersonalityTestSessionService from "./personalityTestSession";
import PersonalityTestAnswerService from "./personalityTestAnswer";



export interface IServiceRegistry {
  users: ReturnType<typeof UsersService>
  candidateArchives: ReturnType<typeof CandidateArchivesService>
  jobs: ReturnType<typeof JobsService>
  archiveJobs: ReturnType<typeof ArchiveJobsService>
  departments: ReturnType<typeof DepartmentsService>
  categories: ReturnType<typeof CategoryService>
  personalityTestResult: ReturnType<typeof PersonalityTestService>
  recruitmentStages: ReturnType<typeof RecruitmentStagesService>
  recruitmentStageSteps: ReturnType<typeof RecruitmentStageStepsService>
  recruitmentEmailConfigs: ReturnType<typeof RecruitmentEmailConfigsService>
  skills: ReturnType<typeof SkillsService>
  meetings: ReturnType<typeof MeetingsService>
  configs: ReturnType<typeof ConfigsService>
  jobApplications: ReturnType<typeof JobApplicationsService>
  jobApplicationsArchives: ReturnType<typeof JobApplicationsArchivesService>
  candidates: ReturnType<typeof CandidatesService>
  cv: ReturnType<typeof CVService>
  candidateExperiences: ReturnType<typeof CandidateExperiencesService>
  candidateEducations: ReturnType<typeof CandidateEducationsService>
  candidateLanguages: ReturnType<typeof CandidateLanguagesService>
  candidateSkills: ReturnType<typeof CandidateSkillsService>
  candidateCertificates: ReturnType<typeof CandidateCertificatesService>
  candidateComments: ReturnType<typeof CandidateCommentsService>
  onboardingworkflows: ReturnType<typeof OnboardingworkflowsService>;
  onboardingresponses: ReturnType<typeof OnboardingResponseService>;
  employees: ReturnType<typeof EmployeesService>;
  mails: ReturnType<typeof MailsService>;
  candidateCv: ReturnType<typeof CandidateCvtoJsonService>;
  aiEvaluation: ReturnType<typeof AiEvaluationService>;
  archiveAiEvaluation: ReturnType<typeof ArchiveAiEvaluationService>;
  candidateEvaluations: ReturnType<typeof CandidateEvaluationsService>;
  evaluationTemplates: ReturnType<typeof EvaluationTemplatesService>;
  candidateOnboardings: ReturnType<typeof CandidateOnboardingsService>;
  emailTemplates: ReturnType<typeof EmailTemplatesService>;
  disqualifyEmailTemplates: ReturnType<typeof DisqualifyEmailTemplatesService>;
  permissions: ReturnType<typeof PermissionsService>;
  postingChannels: ReturnType<typeof PostingChannelsService>;
  tenantMembers: ReturnType<typeof TenantMembersService>;
  tenants: ReturnType<typeof TenantsService>;
  tenantUsageQuoteLogs: ReturnType<typeof TenantUsageQuoteLogsService>;
  notifications: ReturnType<typeof NotificatonService>
  interview: ReturnType<typeof AiInterviewService>
  countries: ReturnType<typeof CountriesService>
  interviewAnswers: ReturnType<typeof AiInterviewAnswersService>
  candidateChat: ReturnType<typeof CandidateChatService>
  jobApplicationsWithWhatsapp: ReturnType<typeof JobApplicationsWithWhatsappService>
  quotas: ReturnType<typeof QuotasService>
  candidateBlackLists: ReturnType<typeof CandidateBlackListsService>

  interviewQuestions: ReturnType<typeof InterviewQuestionsService>
  candidateInterview: ReturnType<typeof CandidateInterviewService>
  candidateInterviewAnswers: ReturnType<typeof CandidateInterviewAnswersService>
  interviewAutomation: ReturnType<typeof InterviewAutomationService>
  quizQuestions: ReturnType<typeof QuizQuestionsService>
  quizSets: ReturnType<typeof QuizSetsService>
  userQuizAssignments: ReturnType<typeof UserQuizAssignmentsService>
  quizSessions: ReturnType<typeof QuizSessionsService>
  userQuizAnswers: ReturnType<typeof UserQuizAnswersService>
  personalityTestSession: ReturnType<typeof PersonalityTestSessionService>
  personalityTestAnswer: ReturnType<typeof PersonalityTestAnswerService>

}

const serviceRegistry = (): IServiceRegistry => {
  const usersService = UsersService()
  const candidateArchivesService = CandidateArchivesService()
  const jobsService = JobsService()
  const archiveJobsService = ArchiveJobsService()
  const departmentsService = DepartmentsService()
  const categoryService = CategoryService()
  const personalityTestService = PersonalityTestService()
  const recruitmentStagesService = RecruitmentStagesService()
  const recruitmentStageStepsService = RecruitmentStageStepsService()
  const recruitmentEmailConfigsService = RecruitmentEmailConfigsService()
  const skillsService = SkillsService()
  const meetingsService = MeetingsService()
  const configsService = ConfigsService()
  const jobApplicationsService = JobApplicationsService()
  const jobApplicationsArchivesService = JobApplicationsArchivesService()
  const candidatesService = CandidatesService()
  const cvService = CVService()
  const candidateExperiencesService = CandidateExperiencesService()
  const candidateEducationsService = CandidateEducationsService()
  const candidateLanguagesService = CandidateLanguagesService()
  const candidateSkillsService = CandidateSkillsService()
  const candidateCertificatesService = CandidateCertificatesService()
  const candidateCommentsService = CandidateCommentsService()
  const onboardingworkflowsService = OnboardingworkflowsService();
  const employeesService = EmployeesService();
  const onboardingresponsesService = OnboardingResponseService();
  const mailsService = MailsService();
  const candidateCvtoJsonService = CandidateCvtoJsonService();
  const aiEvaluationService = AiEvaluationService();
  const archiveAiEvaluationService = ArchiveAiEvaluationService();
  const candidateEvaluationsService = CandidateEvaluationsService();
  const evaluationTemplatesService = EvaluationTemplatesService()
  const candidateOnboardingsService = CandidateOnboardingsService();
  const emailTemplatesService = EmailTemplatesService();
  const disqualifyEmailTemplatesService = DisqualifyEmailTemplatesService();
  const permissionsService = PermissionsService();
  const postingChannelsService = PostingChannelsService();
  const tenantMembersService = TenantMembersService();
  const tenantsService = TenantsService();
  const tenantUsageQuoteLogsService = TenantUsageQuoteLogsService();
  const notificationService = NotificatonService()
  const interviewService = AiInterviewService()
  const interviewAnswersService = AiInterviewAnswersService()
  const countriesService = CountriesService()
  const candidateChatService = CandidateChatService();
  const jobApplicationsWithWhatsappService = JobApplicationsWithWhatsappService()
  const quotasService = QuotasService()
  const interviewQuestionsService = InterviewQuestionsService()
  const candidateInterviewService = CandidateInterviewService()
  const candidateInterviewAnswersService = CandidateInterviewAnswersService();
  const interviewAutomationService = InterviewAutomationService();
  const quizQuestionsService = QuizQuestionsService();
  const quizSetsService = QuizSetsService();
  const userQuizAssignmentsService = UserQuizAssignmentsService();
  const quizSessionsService = QuizSessionsService();
  const userQuizAnswersService = UserQuizAnswersService();
  const personalityTestSessionService = PersonalityTestSessionService();
  const personalityTestAnswerService = PersonalityTestAnswerService();



  const candidateBlackListsService = CandidateBlackListsService()
  return {
    users: usersService,
    candidateArchives: candidateArchivesService,
    jobs: jobsService,
    archiveJobs: archiveJobsService,
    departments: departmentsService,
    categories: categoryService,
    personalityTestResult: personalityTestService,
    recruitmentStages: recruitmentStagesService,
    recruitmentStageSteps: recruitmentStageStepsService,
    recruitmentEmailConfigs: recruitmentEmailConfigsService,
    skills: skillsService,
    meetings: meetingsService,
    configs: configsService,
    jobApplications: jobApplicationsService,
    jobApplicationsArchives: jobApplicationsArchivesService,
    candidates: candidatesService,
    cv: cvService,
    candidateExperiences: candidateExperiencesService,
    candidateEducations: candidateEducationsService,
    candidateLanguages: candidateLanguagesService,
    candidateSkills: candidateSkillsService,
    candidateCertificates: candidateCertificatesService,
    candidateComments: candidateCommentsService,
    onboardingworkflows: onboardingworkflowsService,
    onboardingresponses: onboardingresponsesService,
    employees: employeesService,
    mails: mailsService,
    candidateCv: candidateCvtoJsonService,
    aiEvaluation: aiEvaluationService,
    archiveAiEvaluation: archiveAiEvaluationService,
    candidateEvaluations: candidateEvaluationsService,
    evaluationTemplates: evaluationTemplatesService,
    candidateOnboardings: candidateOnboardingsService,
    emailTemplates: emailTemplatesService,
    disqualifyEmailTemplates: disqualifyEmailTemplatesService,
    permissions: permissionsService,
    postingChannels: postingChannelsService,
    tenantMembers: tenantMembersService,
    tenants: tenantsService,
    tenantUsageQuoteLogs: tenantUsageQuoteLogsService,
    notifications: notificationService,
    interview: interviewService,
    countries: countriesService,
    interviewAnswers: interviewAnswersService,
    candidateChat: candidateChatService,
    jobApplicationsWithWhatsapp: jobApplicationsWithWhatsappService,
    quotas: quotasService,
    candidateBlackLists: candidateBlackListsService,
    interviewQuestions: interviewQuestionsService,
    candidateInterview: candidateInterviewService,
    candidateInterviewAnswers: candidateInterviewAnswersService,
    interviewAutomation: interviewAutomationService,
    quizQuestions: quizQuestionsService,
    quizSets: quizSetsService,
    userQuizAssignments: userQuizAssignmentsService,
    quizSessions: quizSessionsService,
    userQuizAnswers: userQuizAnswersService,
    personalityTestSession: personalityTestSessionService,
    personalityTestAnswer: personalityTestAnswerService
  };
}
export default serviceRegistry;