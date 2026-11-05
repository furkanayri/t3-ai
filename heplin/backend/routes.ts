import Router from "koa-router"
import m from "@/middlewares/executeNodes"
import sharedauthenticate from "@/functions/shared/authenticate"
import skillsgetAllSkills from "@/functions/skills/getAllSkills"
import sharedcheckUserPermission from "@/functions/shared/checkUserPermission"
import skillscreateSkill from "@/functions/skills/createSkill"
import skillsgetSkill from "@/functions/skills/getSkill"
import sharedcheckTenant from "@/functions/shared/checkTenant"
import dashboardfetchMetrics from "@/functions/dashboard/fetchMetrics"
import emailssendTemplatedEmailAfterStep from "@/functions/emails/sendTemplatedEmailAfterStep"
import jobsgetAllJobsOfTenant from "@/functions/jobs/getAllJobsOfTenant"
import jobsgetArchiveJobsOfTenant from "@/functions/jobs/getArchiveJobsOfTenant"
import quotascheckQuota from "@/functions/quotas/checkQuota"
import jobscreateJob from "@/functions/jobs/createJob"
import jobscreateArchiveJob from "@/functions/jobs/createArchiveJob"
import jobsbulkCVUpload from "@/functions/jobs/bulkCVUpload"
import jobsgenerateJobDescription from "@/functions/jobs/generateJobDescription"
import jobsgetJobOfTenant from "@/functions/jobs/getJobOfTenant"
import jobsgetArchiveJobOfTenant from "@/functions/jobs/getArchiveJobOfTenant"
import jobsupdateJob from "@/functions/jobs/updateJob"
import jobsupdateJobApplicationEmployee from "@/functions/jobs/updateJobApplicationEmployee"
import jobsupdateJobApplicationIsReview from "@/functions/jobs/updateJobApplicationIsReview"
import jobstogglePublish from "@/functions/jobs/togglePublish"
import jobsjobsByDomain from "@/functions/jobs/jobsByDomain"
import jobsgetOneJobById from "@/functions/jobs/getOneJobById"
import jobsgetJobsOfChannel from "@/functions/jobs/getJobsOfChannel"
import jobsapplicants from "@/functions/jobs/applicants"
import jobsarchiveJobApplicants from "@/functions/jobs/archiveJobApplicants"
import jobshiringTeams from "@/functions/jobs/hiringTeams"
import jobsmoveCandidateStep from "@/functions/jobs/moveCandidateStep"
import jobsincreaseView from "@/functions/jobs/increaseView"
import jobsdisqualifyOneApplication from "@/functions/jobs/disqualifyOneApplication"
import jobsdisqualifyApplicationsInStep from "@/functions/jobs/disqualifyApplicationsInStep"
import jobsdeleteJob from "@/functions/jobs/deleteJob"
import jobsaiEvaluation from "@/functions/jobs/aiEvaluation"
import departmentsgetAllDepartmentsOfTenant from "@/functions/departments/getAllDepartmentsOfTenant"
import departmentscreateDepartment from "@/functions/departments/createDepartment"
import departmentsgetDepartment from "@/functions/departments/getDepartment"
import departmentsupdateDepartment from "@/functions/departments/updateDepartment"
import departmentsdeleteDepartment from "@/functions/departments/deleteDepartment"
import recruitmentStagesgetAllRecruitmentStagesOfTenant from "@/functions/recruitmentStages/getAllRecruitmentStagesOfTenant"
import recruitmentStagescreateRecruitmentStage from "@/functions/recruitmentStages/createRecruitmentStage"
import recruitmentStagesgetRecruitmentStageOfTenant from "@/functions/recruitmentStages/getRecruitmentStageOfTenant"
import recruitmentStagesupdateRecruitmentStage from "@/functions/recruitmentStages/updateRecruitmentStage"
import recruitmentStagesdeleteRecruitmentStage from "@/functions/recruitmentStages/deleteRecruitmentStage"
import recruitmentStageStepsgetAllRecruitmentStageStepsOfTenant from "@/functions/recruitmentStageSteps/getAllRecruitmentStageStepsOfTenant"
import recruitmentStageStepscreateRecruitmentStageStep from "@/functions/recruitmentStageSteps/createRecruitmentStageStep"
import recruitmentStageStepsgetRecruitmentStageStepOfTenant from "@/functions/recruitmentStageSteps/getRecruitmentStageStepOfTenant"
import recruitmentStageStepsupdateRecruitmentStageStep from "@/functions/recruitmentStageSteps/updateRecruitmentStageStep"
import recruitmentStageStepsdeleteRecruitmentStageStep from "@/functions/recruitmentStageSteps/deleteRecruitmentStageStep"
import recruitmentEmailConfigsfetchAllEmailConfigsOfStage from "@/functions/recruitmentEmailConfigs/fetchAllEmailConfigsOfStage"
import recruitmentEmailConfigsgetEmailConfigOfStep from "@/functions/recruitmentEmailConfigs/getEmailConfigOfStep"
import recruitmentEmailConfigscreateRecruitmentEmailConfig from "@/functions/recruitmentEmailConfigs/createRecruitmentEmailConfig"
import recruitmentEmailConfigsupdateRecruitmentEmailConfig from "@/functions/recruitmentEmailConfigs/updateRecruitmentEmailConfig"
import recruitmentEmailConfigsdeleteRecruitmentEmailConfig from "@/functions/recruitmentEmailConfigs/deleteRecruitmentEmailConfig"
import meetingsgetAllMeetingsOfTenant from "@/functions/meetings/getAllMeetingsOfTenant"
import meetingscreateMeeting from "@/functions/meetings/createMeeting"
import meetingsupdateMeeting from "@/functions/meetings/updateMeeting"
import meetingsgetMeetingOfTenant from "@/functions/meetings/getMeetingOfTenant"
import meetingsdeleteMeeting from "@/functions/meetings/deleteMeeting"
import candidatemyApplications from "@/functions/candidate/myApplications"
import candidatedeleteApplication from "@/functions/candidate/deleteApplication"
import candidateonboardgetMyOnboardingDetail from "@/functions/candidate/onboard/getMyOnboardingDetail"
import candidateonboardupdateMyOnboarding from "@/functions/candidate/onboard/updateMyOnboarding"
import candidatejobsapply from "@/functions/candidate/jobs/apply"
import jobsgeminiAiEvaluation from "@/functions/jobs/geminiAiEvaluation"
import candidatemyCVs from "@/functions/candidate/myCVs"
import candidateupdateCV from "@/functions/candidate/updateCV"
import candidatedeleteCV from "@/functions/candidate/deleteCV"
import candidatejobsgetOnePublicJob from "@/functions/candidate/jobs/getOnePublicJob"
import candidateapplicationDetail from "@/functions/candidate/applicationDetail"
import meetingsgetMyMeetings from "@/functions/meetings/getMyMeetings"
import meetingsmeetingSignature from "@/functions/meetings/meetingSignature"
import uploadpublicUpload from "@/functions/upload/publicUpload"
import uploadreadFile from "@/functions/upload/readFile"
import uploadpublicUploadTenantLogo from "@/functions/upload/publicUploadTenantLogo"
import uploadreadCV from "@/functions/upload/readCV"
import uploadreadVideo from "@/functions/upload/readVideo"
import uploadgetVideoPresignedUrl from "@/functions/upload/getVideoPresignedUrl"
import uploadprivateUpload from "@/functions/upload/privateUpload"
import uploaduploadCV from "@/functions/upload/uploadCV"
import uploadgeneratePresignedUrl from "@/functions/upload/generatePresignedUrl"
import uploadtranscribeVideoFromR2 from "@/functions/upload/transcribeVideoFromR2"
import candidatecvAutoFillautoFill from "@/functions/candidate/cvAutoFill/autoFill"
import uploadjsonToAutoFill from "@/functions/upload/jsonToAutoFill"
import candidateeducationsmyEducations from "@/functions/candidate/educations/myEducations"
import candidateeducationscreateEducation from "@/functions/candidate/educations/createEducation"
import candidateeducationsupdateEducation from "@/functions/candidate/educations/updateEducation"
import candidateeducationsgetOneEducation from "@/functions/candidate/educations/getOneEducation"
import candidateeducationsdeleteEducation from "@/functions/candidate/educations/deleteEducation"
import candidateexperiencesmyExperiences from "@/functions/candidate/experiences/myExperiences"
import candidateexperiencescreateExperience from "@/functions/candidate/experiences/createExperience"
import candidateexperiencesgetOneExperience from "@/functions/candidate/experiences/getOneExperience"
import candidateexperiencesupdateExperience from "@/functions/candidate/experiences/updateExperience"
import candidateexperiencesdeleteExperience from "@/functions/candidate/experiences/deleteExperience"
import candidatecertificatesmyCertificates from "@/functions/candidate/certificates/myCertificates"
import candidatecertificatescreateCertificate from "@/functions/candidate/certificates/createCertificate"
import candidatecertificatesgetOneCertificate from "@/functions/candidate/certificates/getOneCertificate"
import candidatecertificatesupdateCertificate from "@/functions/candidate/certificates/updateCertificate"
import candidatecertificatesdeleteCertificate from "@/functions/candidate/certificates/deleteCertificate"
import candidatelanguagesmyLanguages from "@/functions/candidate/languages/myLanguages"
import candidatelanguagescreateLanguage from "@/functions/candidate/languages/createLanguage"
import candidatelanguagesgetOneLanguage from "@/functions/candidate/languages/getOneLanguage"
import candidatelanguagesupdateLanguage from "@/functions/candidate/languages/updateLanguage"
import candidatelanguagesdeleteLanguage from "@/functions/candidate/languages/deleteLanguage"
import candidateskillsmySkills from "@/functions/candidate/skills/mySkills"
import candidateskillscreateSkill from "@/functions/candidate/skills/createSkill"
import candidateskillsgetOneSkill from "@/functions/candidate/skills/getOneSkill"
import candidateskillsupdateSkill from "@/functions/candidate/skills/updateSkill"
import candidateskillsdeleteSkill from "@/functions/candidate/skills/deleteSkill"
import candidateeducationsgetAllEducationsOfTenant from "@/functions/candidate/educations/getAllEducationsOfTenant"
import candidatesgetAllCandidatesOfTenant from "@/functions/candidates/getAllCandidatesOfTenant"
import candidatesgetOneCandidateOfTenant from "@/functions/candidates/getOneCandidateOfTenant"
import candidatesgetOneArchiveCandidateOfTenant from "@/functions/candidates/getOneArchiveCandidateOfTenant"
import candidatesgetAllCVsOfCandidate from "@/functions/candidates/getAllCVsOfCandidate"
import candidatescommentsgetAllCommentsOfCandidate from "@/functions/candidates/comments/getAllCommentsOfCandidate"
import candidatescommentscreateComment from "@/functions/candidates/comments/createComment"
import candidatescommentsgetCommentOfCandidate from "@/functions/candidates/comments/getCommentOfCandidate"
import candidatescommentsdeleteComment from "@/functions/candidates/comments/deleteComment"
import authlogout from "@/functions/auth/logout"
import authforgotPassword from "@/functions/auth/forgotPassword"
import authchangePassword from "@/functions/auth/changePassword"
import authlogin from "@/functions/auth/login"
import authregister from "@/functions/auth/register"
import authsendSmsOTP from "@/functions/auth/sendSmsOTP"
import authcheckUserPassword from "@/functions/auth/checkUserPassword"
import authverifyCode from "@/functions/auth/verifyCode"
import authverifySmsOTP from "@/functions/auth/verifySmsOTP"
import authoauthExchange from "@/functions/auth/oauthExchange"
import authoauth from "@/functions/auth/oauth"
import authgoogle from "@/functions/auth/google"
import authgoogleCallback from "@/functions/auth/googleCallback"
import authLinkedin from "@/functions/auth/Linkedin"
import authLinkedinCallback from "@/functions/auth/LinkedinCallback"
import outsideJobsfetchJobs from "@/functions/outsideJobs/fetchJobs"
import outsideJobsfetchJobById from "@/functions/outsideJobs/fetchJobById"
import onboardingworkflowsfindAll from "@/functions/onboardingworkflows/findAll"
import onboardingworkflowsassignToUser from "@/functions/onboardingworkflows/assignToUser"
import onboardingworkflowsfind from "@/functions/onboardingworkflows/find"
import onboardingworkflowscreate from "@/functions/onboardingworkflows/create"
import onboardingworkflowsupdate from "@/functions/onboardingworkflows/update"
import onboardingworkflowsdelete from "@/functions/onboardingworkflows/delete"
import onboardingresponsesfindAll from "@/functions/onboardingresponses/findAll"
import onboardingresponseschangeStatus from "@/functions/onboardingresponses/changeStatus"
import onboardingresponsesfind from "@/functions/onboardingresponses/find"
import onboardingresponsescreate from "@/functions/onboardingresponses/create"
import onboardingresponsesupdate from "@/functions/onboardingresponses/update"
import onboardingresponsesdelete from "@/functions/onboardingresponses/delete"
import employeesgetAllEmployeesOfTenant from "@/functions/employees/getAllEmployeesOfTenant"
import employeesgetMyEmployeeData from "@/functions/employees/getMyEmployeeData"
import employeescreateEmployee from "@/functions/employees/createEmployee"
import employeesgetEmployee from "@/functions/employees/getEmployee"
import employeesupdateEmployee from "@/functions/employees/updateEmployee"
import employeesdeleteEmployee from "@/functions/employees/deleteEmployee"
import applicantsfetchApplicants from "@/functions/applicants/fetchApplicants"
import applicantsapplicantDetail from "@/functions/applicants/applicantDetail"
import applicantsupdate from "@/functions/applicants/update"
import mailsfindAll from "@/functions/mails/findAll"
import mailsfindAllOfCandidate from "@/functions/mails/findAllOfCandidate"
import mailsfind from "@/functions/mails/find"
import mailsdownloadAttachment from "@/functions/mails/downloadAttachment"
import mailscreate from "@/functions/mails/create"
import mailsaction from "@/functions/mails/action"
import mailsdelete from "@/functions/mails/delete"
import mailssendMailAnotherJob from "@/functions/mails/sendMailAnotherJob"
import candidatesevaluationsgetAll from "@/functions/candidates/evaluations/getAll"
import candidatesevaluationscreate from "@/functions/candidates/evaluations/create"
import candidatesevaluationsgetOne from "@/functions/candidates/evaluations/getOne"
import candidatesevaluationsupdate from "@/functions/candidates/evaluations/update"
import candidatesevaluationsdelete from "@/functions/candidates/evaluations/delete"
import candidatesonboardingsgetAll from "@/functions/candidates/onboardings/getAll"
import candidatesonboardingsgetOne from "@/functions/candidates/onboardings/getOne"
import candidatesonboardingscreate from "@/functions/candidates/onboardings/create"
import evaluationTemplatesgetAllOfTenant from "@/functions/evaluationTemplates/getAllOfTenant"
import evaluationTemplatescreate from "@/functions/evaluationTemplates/create"
import evaluationTemplatesgetOneOfTenant from "@/functions/evaluationTemplates/getOneOfTenant"
import evaluationTemplatesupdate from "@/functions/evaluationTemplates/update"
import evaluationTemplatesdelete from "@/functions/evaluationTemplates/delete"
import sharedcheckAdminTenant from "@/functions/shared/checkAdminTenant"
import sharedcheckAdminPermission from "@/functions/shared/checkAdminPermission"
import adminpostingChannelsgetAllOfAdminTenant from "@/functions/admin/postingChannels/getAllOfAdminTenant"
import adminpostingChannelsgetAllByTenantId from "@/functions/admin/postingChannels/getAllByTenantId"
import admincandidatesgetAllCandidatesOfAdminTenant from "@/functions/admin/candidates/getAllCandidatesOfAdminTenant"
import admincandidatesgetAllCandidatesOfTenant from "@/functions/admin/candidates/getAllCandidatesOfTenant"
import admincandidatesgetById from "@/functions/admin/candidates/getById"
import admincandidatesgetCandidateProfile from "@/functions/admin/candidates/getCandidateProfile"
import admincandidatesupdateCandidateProfile from "@/functions/admin/candidates/updateCandidateProfile"
import adminemployeesgetAllEmployeesByTenantId from "@/functions/admin/employees/getAllEmployeesByTenantId"
import adminjobsgetAllJobsOfAdminTenant from "@/functions/admin/jobs/getAllJobsOfAdminTenant"
import adminjobsgetById from "@/functions/admin/jobs/getById"
import adminjobsgetApplicationsOfJob from "@/functions/admin/jobs/getApplicationsOfJob"
import adminjobsupdateJob from "@/functions/admin/jobs/updateJob"
import adminjobsdeleteJob from "@/functions/admin/jobs/deleteJob"
import admintenantsgetAllTenantsOfAdminTenant from "@/functions/admin/tenants/getAllTenantsOfAdminTenant"
import admintenantsgetAllTenantsList from "@/functions/admin/tenants/getAllTenantsList"
import admintenantsupdateOneTenant from "@/functions/admin/tenants/updateOneTenant"
import adminpostingChannelsgetOne from "@/functions/admin/postingChannels/getOne"
import adminpostingChannelscreate from "@/functions/admin/postingChannels/create"
import adminpostingChannelspopulatePostingChannels from "@/functions/admin/postingChannels/populatePostingChannels"
import adminpostingChannelsupdate from "@/functions/admin/postingChannels/update"
import adminpostingChannelsdelete from "@/functions/admin/postingChannels/delete"
import adminapplicationsfetchApplications from "@/functions/admin/applications/fetchApplications"
import profilecreateProfile from "@/functions/profile/createProfile"
import profilegetMe from "@/functions/profile/getMe"
import profileupdateMe from "@/functions/profile/updateMe"
import profiletenantsOfUser from "@/functions/profile/tenantsOfUser"
import profilepostingChannelsOfUser from "@/functions/profile/postingChannelsOfUser"
import profilelistManageablePostingChannelsOfUser from "@/functions/profile/listManageablePostingChannelsOfUser"
import profilepermissionsOfUser from "@/functions/profile/permissionsOfUser"
import tenantsgetAllTenants from "@/functions/tenants/getAllTenants"
import tenantscreateOneTenant from "@/functions/tenants/createOneTenant"
import tenantColordetermineTenantColor from "@/functions/tenantColor/determineTenantColor"
import tenantscreateTenantForCompany from "@/functions/tenants/createTenantForCompany"
import tenantscreateCompanyTenant from "@/functions/tenants/createCompanyTenant"
import tenantsgetTenantInfoByDomain from "@/functions/tenants/getTenantInfoByDomain"
import tenantsgetOneTenant from "@/functions/tenants/getOneTenant"
import tenantstenantQr from "@/functions/tenants/tenantQr"
import tenantsupdateOneTenant from "@/functions/tenants/updateOneTenant"
import tenantsdeleteOneTenant from "@/functions/tenants/deleteOneTenant"
import tenantsmembersgetAllMembersOfTenant from "@/functions/tenants/members/getAllMembersOfTenant"
import tenantsmembersinviteMemberToTenant from "@/functions/tenants/members/inviteMemberToTenant"
import tenantsmembersresendCreateProfileEmail from "@/functions/tenants/members/resendCreateProfileEmail"
import tenantsmembersgetMemberOfTenant from "@/functions/tenants/members/getMemberOfTenant"
import tenantsmembersremoveMemberFromTenant from "@/functions/tenants/members/removeMemberFromTenant"
import tenantsmembersupdateOneMember from "@/functions/tenants/members/updateOneMember"
import permissionscheckPermissionListAccess from "@/functions/permissions/checkPermissionListAccess"
import permissionsgetMemberPermissions from "@/functions/permissions/getMemberPermissions"
import permissionscheckPermissionManageAccess from "@/functions/permissions/checkPermissionManageAccess"
import permissionsmanagePermissionsOfUser from "@/functions/permissions/managePermissionsOfUser"
import healthyCheckhealthyCheck from "@/functions/healthyCheck/healthyCheck"
import emailTemplatescreate from "@/functions/emailTemplates/create"
import emailTemplatesgetAll from "@/functions/emailTemplates/getAll"
import emailTemplatesgetOne from "@/functions/emailTemplates/getOne"
import emailTemplatesdelete from "@/functions/emailTemplates/delete"
import emailTemplatesupdate from "@/functions/emailTemplates/update"
import disqualifyEmailTemplatescreate from "@/functions/disqualifyEmailTemplates/create"
import disqualifyEmailTemplatesgetOne from "@/functions/disqualifyEmailTemplates/getOne"
import disqualifyEmailTemplatesdelete from "@/functions/disqualifyEmailTemplates/delete"
import disqualifyEmailTemplatesupdate from "@/functions/disqualifyEmailTemplates/update"
import categoriesgetAllCategory from "@/functions/categories/getAllCategory"
import categoriesgetAllJobsOfCategory from "@/functions/categories/getAllJobsOfCategory"
import categoriescreateTenantCategory from "@/functions/categories/createTenantCategory"
import admincategoriescreateCategory from "@/functions/admin/categories/createCategory"
import admincategoriesupdateCategory from "@/functions/admin/categories/updateCategory"
import admincategoriesdeleteCategory from "@/functions/admin/categories/deleteCategory"
import adminuserscreate from "@/functions/admin/users/create"
import adminusersupdateOneUser from "@/functions/admin/users/updateOneUser"
import adminusersgetAll from "@/functions/admin/users/getAll"
import adminusersgetById from "@/functions/admin/users/getById"
import adminusersgetUserExperiences from "@/functions/admin/users/getUserExperiences"
import adminuserscreateUserExperience from "@/functions/admin/users/createUserExperience"
import adminusersdeleteUserExperience from "@/functions/admin/users/deleteUserExperience"
import adminusersupdateUserExperience from "@/functions/admin/users/updateUserExperience"
import adminusersgetUserEducations from "@/functions/admin/users/getUserEducations"
import adminusersupdateUserEducation from "@/functions/admin/users/updateUserEducation"
import adminusersdeleteUserEducation from "@/functions/admin/users/deleteUserEducation"
import adminuserscreateUserEducation from "@/functions/admin/users/createUserEducation"
import adminusersgetUserCertificates from "@/functions/admin/users/getUserCertificates"
import adminusersupdateUserCertificate from "@/functions/admin/users/updateUserCertificate"
import adminusersdeleteUserCertificate from "@/functions/admin/users/deleteUserCertificate"
import adminuserscreateUserCertificate from "@/functions/admin/users/createUserCertificate"
import adminusersgetUserLanguages from "@/functions/admin/users/getUserLanguages"
import adminusersupdateUserLanguage from "@/functions/admin/users/updateUserLanguage"
import adminusersdeleteUserLanguage from "@/functions/admin/users/deleteUserLanguage"
import adminuserscreateUserLanguage from "@/functions/admin/users/createUserLanguage"
import adminusersgetUserSkills from "@/functions/admin/users/getUserSkills"
import adminusersupdateUserSkill from "@/functions/admin/users/updateUserSkill"
import adminusersdeleteUserSkill from "@/functions/admin/users/deleteUserSkill"
import adminuserscreateUserSkill from "@/functions/admin/users/createUserSkill"
import adminuserscreateUserCv from "@/functions/admin/users/createUserCv"
import adminusersgetUserCvs from "@/functions/admin/users/getUserCvs"
import adminusersdeleteUserCv from "@/functions/admin/users/deleteUserCv"
import notificationsgetAllNotifications from "@/functions/notifications/getAllNotifications"
import notificationsmarkAsRead from "@/functions/notifications/markAsRead"
import notificationsdeleteNotification from "@/functions/notifications/deleteNotification"
import countrygetCountries from "@/functions/country/getCountries"
import countrygetCountry from "@/functions/country/getCountry"
import croncheckJobEndDateCronJob from "@/functions/cron/checkJobEndDateCronJob"
import cronsendDisqualifyMailCronJob from "@/functions/cron/sendDisqualifyMailCronJob"
import cronparseMailCronJob from "@/functions/cron/parseMailCronJob"
import usersdeleteUserOfTenantMembers from "@/functions/users/deleteUserOfTenantMembers"
import aievaluationcreate from "@/functions/aievaluation/create"
import aievaluationgetone from "@/functions/aievaluation/getone"
import aievaluationgetall from "@/functions/aievaluation/getall"
import achiveAievaluationcreate from "@/functions/achiveAievaluation/create"
import achiveAievaluationgetOneArchiveAiEvaluation from "@/functions/achiveAievaluation/getOneArchiveAiEvaluation"
import jobsgetAiInterviewById from "@/functions/jobs/getAiInterviewById"
import jobsupdateAiInterview from "@/functions/jobs/updateAiInterview"
import jobsgetTenantofInterviewAnswer from "@/functions/jobs/getTenantofInterviewAnswer"
import jobsgetTenantofInterviewAnswergetAll from "@/functions/jobs/getTenantofInterviewAnswergetAll"
import whatsappsendwhatsappWebhook from "@/functions/whatsapp/sendwhatsappWebhook"
import whatsappwhatsappWebhook from "@/functions/whatsapp/whatsappWebhook"
import personaltestcreate from "@/functions/personaltest/create"
import personaltestanswer from "@/functions/personaltest/answer"
import personaltestfind from "@/functions/personaltest/find"
import candidateBlackListscandidateBlackList from "@/functions/candidateBlackLists/candidateBlackList"
import candidateBlackListsremoveCandidateBlackList from "@/functions/candidateBlackLists/removeCandidateBlackList"
import quotasgetQuota from "@/functions/quotas/getQuota"
import uploadpublicUploadForAutoFill from "@/functions/upload/publicUploadForAutoFill"
import uploaduploadParseCV from "@/functions/upload/uploadParseCV"
import jobsapplicationWithoutRegister from "@/functions/jobs/applicationWithoutRegister"
import adminquotasgetTenantQuotas from "@/functions/admin/quotas/getTenantQuotas"
import adminquotasupdateTenantQuotas from "@/functions/admin/quotas/updateTenantQuotas"
import telegramBottelegramBot from "@/functions/telegramBot/telegramBot"
import cinterviewgetAllInterview from "@/functions/cinterview/getAllInterview"
import candidateInterviewgetTenantInterviewanswers from "@/functions/candidateInterview/getTenantInterviewanswers"
import candidateInterviewgetInterviewAnswers from "@/functions/candidateInterview/getInterviewAnswers"
import candidateInterviewgetAnswersByType from "@/functions/candidateInterview/getAnswersByType"
import candidateInterviewgetBatchVideoEvaluation from "@/functions/candidateInterview/getBatchVideoEvaluation"
import cinterviewcreateInterview from "@/functions/cinterview/createInterview"
import cinterviewdeleteInterview from "@/functions/cinterview/deleteInterview"
import interviewQuestionsupdateInterviewQuestions from "@/functions/interviewQuestions/updateInterviewQuestions"
import interviewQuestionsgetinterviewQuestions from "@/functions/interviewQuestions/getinterviewQuestions"
import interviewQuestionscreateInterviewQuestionWithJob from "@/functions/interviewQuestions/createInterviewQuestionWithJob"
import interviewQuestionscreateInterviewQuestionWithText from "@/functions/interviewQuestions/createInterviewQuestionWithText"
import interviewQuestionsquestionToSpeech from "@/functions/interviewQuestions/questionToSpeech"
import cinterviewinterviewInvitation from "@/functions/cinterview/interviewInvitation"
import candidateInterviewgetAllCandidateInterview from "@/functions/candidateInterview/getAllCandidateInterview"
import candidateInterviewgetOneCandidateInterview from "@/functions/candidateInterview/getOneCandidateInterview"
import candidateInterviewgetCandidateInterviewQuestion from "@/functions/candidateInterview/getCandidateInterviewQuestion"
import candidateInterviewupdateCandidateInterview from "@/functions/candidateInterview/updateCandidateInterview"
import candidateAnswersgetCandidateAnswers from "@/functions/candidateAnswers/getCandidateAnswers"
import candidateAnswersupdateCandidateAnswers from "@/functions/candidateAnswers/updateCandidateAnswers"
import candidateAnswersupdateCandidateVideoAnswers from "@/functions/candidateAnswers/updateCandidateVideoAnswers"
import candidateInterviewinterviewLogs from "@/functions/candidateInterview/interviewLogs"
import candidateInterviewevaluateCandidateVideoInterview from "@/functions/candidateInterview/evaluateCandidateVideoInterview"
import candidateInterviewevaluateCandidateTextInterview from "@/functions/candidateInterview/evaluateCandidateTextInterview"
import quizQuestionsgetAllQuestions from "@/functions/quizQuestions/getAllQuestions"
import quizQuestionscreateQuestion from "@/functions/quizQuestions/createQuestion"
import quizQuestionsgetQuestionById from "@/functions/quizQuestions/getQuestionById"
import quizQuestionsupdateQuestion from "@/functions/quizQuestions/updateQuestion"
import quizQuestionsdeleteQuestion from "@/functions/quizQuestions/deleteQuestion"
import quizQuestionsgetQuestionsByCategory from "@/functions/quizQuestions/getQuestionsByCategory"
import quizQuestionsgetRandomQuestions from "@/functions/quizQuestions/getRandomQuestions"
import quizQuestionsgetQuestionStats from "@/functions/quizQuestions/getQuestionStats"
import quizQuestionstoggleQuestionStatus from "@/functions/quizQuestions/toggleQuestionStatus"
import quizQuestionsbulkImportQuestions from "@/functions/quizQuestions/bulkImportQuestions"
import quizQuestionsdownloadExcelTemplate from "@/functions/quizQuestions/downloadExcelTemplate"
import quizQuestionsvalidateExcelFile from "@/functions/quizQuestions/validateExcelFile"
import quizSetsgetAllQuizSets from "@/functions/quizSets/getAllQuizSets"
import quizSetscreateQuizSet from "@/functions/quizSets/createQuizSet"
import quizSetsgetQuizSetById from "@/functions/quizSets/getQuizSetById"
import quizSetsupdateQuizSet from "@/functions/quizSets/updateQuizSet"
import quizSetsdeleteQuizSet from "@/functions/quizSets/deleteQuizSet"
import quizSetstoggleQuizSetStatus from "@/functions/quizSets/toggleQuizSetStatus"
import userQuizAssignmentsassignQuizToUser from "@/functions/userQuizAssignments/assignQuizToUser"
import userQuizAssignmentsgetAllAssignments from "@/functions/userQuizAssignments/getAllAssignments"
import userQuizAssignmentsgetUserAssignments from "@/functions/userQuizAssignments/getUserAssignments"
import userQuizAssignmentsgetAssignmentById from "@/functions/userQuizAssignments/getAssignmentById"
import userQuizAssignmentsstartQuiz from "@/functions/userQuizAssignments/startQuiz"
import userQuizAssignmentsupdateAssignment from "@/functions/userQuizAssignments/updateAssignment"
import userQuizAssignmentsdeleteAssignment from "@/functions/userQuizAssignments/deleteAssignment"
import candidatequizAssignmentsgetMyQuizAssignments from "@/functions/candidate/quizAssignments/getMyQuizAssignments"
import candidatequizAssignmentsstartMyQuiz from "@/functions/candidate/quizAssignments/startMyQuiz"
import candidatequizSessionsgetMyQuizSession from "@/functions/candidate/quizSessions/getMyQuizSession"
import candidatequizSessionssubmitMyAnswer from "@/functions/candidate/quizSessions/submitMyAnswer"
import candidatequizSessionscompleteMyQuiz from "@/functions/candidate/quizSessions/completeMyQuiz"
import candidatequizSessionsgetMySessionResults from "@/functions/candidate/quizSessions/getMySessionResults"
import personalityTestcheckEligibility from "@/functions/personalityTest/checkEligibility"
import personalityTeststartTest from "@/functions/personalityTest/startTest"
import personalityTestgetCurrentQuestion from "@/functions/personalityTest/getCurrentQuestion"
import personalityTestsubmitAnswer from "@/functions/personalityTest/submitAnswer"
import personalityTestgetResults from "@/functions/personalityTest/getResults"
import personalityTestgetUserTestHistory from "@/functions/personalityTest/getUserTestHistory"
import personalityTestgetSessionDetails from "@/functions/personalityTest/getSessionDetails"
import cinterviewbulkInterviewInvitation from "@/functions/cinterview/bulkInterviewInvitation"
const router = new Router<{}, Context>();
router.get("/api/v1/skills",m(sharedauthenticate,skillsgetAllSkills))
router.post("/api/v1/skills",m(sharedauthenticate,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_skills"
  ],
  "resource": {
    "tenantId": "*"
  }
}),skillscreateSkill))
router.get("/api/v1/skills/:skillId",m(sharedauthenticate,skillsgetSkill))
router.get("/api/v1/tenants/:tenantId/metrics",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "get_metrics"
  ],
  "resource": {
    "tenantId": true
  }
}),dashboardfetchMetrics))
router.post("/api/v1/tenants/:tenantId/emails/template",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "send_emails"
  ],
  "resource": {
    "tenantId": true
  }
}),emailssendTemplatedEmailAfterStep))
router.get("/api/v1/tenants/:tenantId/jobs",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_jobs"
  ],
  "resource": {
    "tenantId": true
  }
}),jobsgetAllJobsOfTenant))
router.get("/api/v1/tenants/:tenantId/archiveJob",m(sharedauthenticate,sharedcheckTenant,jobsgetArchiveJobsOfTenant))
router.post("/api/v1/tenants/:tenantId/jobs",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_jobs"
  ],
  "resource": {
    "tenantId": true
  }
}),(ctx: Context) => quotascheckQuota(ctx, {
  "target": "job"
}),jobscreateJob))
router.post("/api/v1/tenants/:tenantId/archiveJob",m(sharedauthenticate,sharedcheckTenant,jobscreateArchiveJob))
router.post("/api/v1/tenants/:tenantId/bulkCVUpload",m(sharedauthenticate,jobsbulkCVUpload))
router.post("/api/v1/tenants/:tenantId/jobs/createAiContent",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_jobs"
  ],
  "resource": {
    "tenantId": true
  }
}),jobsgenerateJobDescription))
router.get("/api/v1/tenants/:tenantId/jobs/:jobId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_jobs"
  ],
  "resource": {
    "tenantId": true
  }
}),jobsgetJobOfTenant))
router.get("/api/v1/tenants/:tenantId/archiveJobs/:jobId",m(sharedauthenticate,sharedcheckTenant,jobsgetArchiveJobOfTenant))
router.patch("/api/v1/tenants/:tenantId/jobs/:jobId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_jobs"
  ],
  "resource": {
    "tenantId": true
  }
}),jobsupdateJob))
router.patch("/api/v1/tenants/:tenantId/jobs/:jobId/update-employee",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_jobs"
  ],
  "resource": {
    "tenantId": true
  }
}),jobsupdateJobApplicationEmployee))
router.patch("/api/v1/tenants/:tenantId/jobs/:jobId/viewedBy/:id",m(sharedauthenticate,sharedcheckTenant,jobsupdateJobApplicationIsReview))
router.post("/api/v1/tenants/:tenantId/jobs/:jobId/tooglePublish",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_jobs"
  ],
  "resource": {
    "tenantId": true
  }
}),jobstogglePublish))
router.get("/api/v1/jobsByDomain/:domain",m(jobsjobsByDomain))
router.get("/api/v1/jobs/:jobId",m(jobsgetOneJobById))
router.get("/api/v1/channels/:channelId/jobs",m(jobsgetJobsOfChannel))
router.get("/api/v1/tenants/:tenantId/jobs/:jobId/applicants",m(sharedauthenticate,jobsapplicants))
router.get("/api/v1/tenants/:tenantId/archiveJobs/:jobId/applicants",m(sharedauthenticate,jobsarchiveJobApplicants))
router.get("/api/v1/tenants/:tenantId/jobs/:jobId/hiringTeams",m(sharedauthenticate,jobshiringTeams))
router.post("/api/v1/tenants/:tenantId/jobs/:jobId/applicants/:applicantId/move",m(sharedauthenticate,jobsmoveCandidateStep))
router.post("/api/v1/candidate/jobs/:jobId/view",m(sharedauthenticate,jobsincreaseView))
router.post("/api/v1/tenants/:tenantId/jobs/:jobId/application/disqualify",m(sharedauthenticate,jobsdisqualifyOneApplication))
router.post("/api/v1/tenants/:tenantId/jobs/:jobId/applications/disqualify/bulk",m(sharedauthenticate,jobsdisqualifyApplicationsInStep))
router.delete("/api/v1/tenants/:tenantId/jobs/:jobId",m(sharedauthenticate,jobsdeleteJob))
router.post("/api/v1/tenants/:tenantId/jobs/aiEvaluation",m(sharedauthenticate,jobsaiEvaluation))
router.get("/api/v1/tenants/:tenantId/departments",m(sharedauthenticate,sharedcheckTenant,departmentsgetAllDepartmentsOfTenant))
router.post("/api/v1/tenants/:tenantId/departments",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_departments"
  ],
  "resource": {
    "tenantId": true
  }
}),departmentscreateDepartment))
router.get("/api/v1/tenants/:tenantId/departments/:departmentId",m(sharedauthenticate,sharedcheckTenant,departmentsgetDepartment))
router.patch("/api/v1/tenants/:tenantId/departments/:departmentId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_departments"
  ],
  "resource": {
    "tenantId": true
  }
}),departmentsupdateDepartment))
router.delete("/api/v1/tenants/:tenantId/departments/:departmentId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_departments"
  ],
  "resource": {
    "tenantId": true
  }
}),departmentsdeleteDepartment))
router.get("/api/v1/tenants/:tenantId/recruitment-stages",m(sharedauthenticate,sharedcheckTenant,recruitmentStagesgetAllRecruitmentStagesOfTenant))
router.post("/api/v1/tenants/:tenantId/recruitment-stages",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentStagescreateRecruitmentStage))
router.get("/api/v1/tenants/:tenantId/recruitment-stages/:recruitmentStageId",m(sharedauthenticate,sharedcheckTenant,recruitmentStagesgetRecruitmentStageOfTenant))
router.patch("/api/v1/tenants/:tenantId/recruitment-stages/:recruitmentStageId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentStagesupdateRecruitmentStage))
router.delete("/api/v1/tenants/:tenantId/recruitment-stages/:recruitmentStageId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentStagesdeleteRecruitmentStage))
router.get("/api/v1/tenants/:tenantId/recruitment-stages/:recruitmentStageId/steps",m(sharedauthenticate,sharedcheckTenant,recruitmentStageStepsgetAllRecruitmentStageStepsOfTenant))
router.post("/api/v1/tenants/:tenantId/recruitment-stages/:recruitmentStageId/steps",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentStageStepscreateRecruitmentStageStep))
router.get("/api/v1/tenants/:tenantId/recruitment-stages/:recruitmentStageId/steps/:stepId",m(sharedauthenticate,sharedcheckTenant,recruitmentStageStepsgetRecruitmentStageStepOfTenant))
router.patch("/api/v1/tenants/:tenantId/recruitment-stages/:recruitmentStageId/steps/:stepId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentStageStepsupdateRecruitmentStageStep))
router.delete("/api/v1/tenants/:tenantId/recruitment-stages/:recruitmentStageId/steps/:stepId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentStageStepsdeleteRecruitmentStageStep))
router.get("/api/v1/tenants/:tenantId/recruitment-email-configs",m(sharedauthenticate,sharedcheckTenant,recruitmentEmailConfigsfetchAllEmailConfigsOfStage))
router.get("/api/v1/tenants/:tenantId/recruitment-email-configs/:stepId",m(sharedauthenticate,sharedcheckTenant,recruitmentEmailConfigsgetEmailConfigOfStep))
router.post("/api/v1/tenants/:tenantId/recruitment-email-configs",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentEmailConfigscreateRecruitmentEmailConfig))
router.patch("/api/v1/tenants/:tenantId/recruitment-email-configs/:configId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentEmailConfigsupdateRecruitmentEmailConfig))
router.delete("/api/v1/tenants/:tenantId/recruitment-email-configs/:configId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_recruitment_stage"
  ],
  "resource": {
    "tenantId": true
  }
}),recruitmentEmailConfigsdeleteRecruitmentEmailConfig))
router.get("/api/v1/tenants/:tenantId/meetings",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_meetings"
  ],
  "resource": {
    "tenantId": true
  }
}),meetingsgetAllMeetingsOfTenant))
router.post("/api/v1/tenants/:tenantId/meetings",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_meetings"
  ],
  "resource": {
    "tenantId": true
  }
}),meetingscreateMeeting))
router.patch("/api/v1/tenants/:tenantId/meetings/:meetingId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_meetings"
  ],
  "resource": {
    "tenantId": true
  }
}),meetingsupdateMeeting))
router.get("/api/v1/tenants/:tenantId/meetings/:meetingId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_meetings"
  ],
  "resource": {
    "tenantId": true
  }
}),meetingsgetMeetingOfTenant))
router.delete("/api/v1/tenants/:tenantId/meetings/:meetingId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_meetings"
  ],
  "resource": {
    "tenantId": true
  }
}),meetingsdeleteMeeting))
router.get("/api/v1/candidate/my-applications",m(sharedauthenticate,candidatemyApplications))
router.delete("/api/v1/candidate/my-applications/:applicationId/draw",m(sharedauthenticate,candidatedeleteApplication))
router.get("/api/v1/candidate/onboard/:onboardingId",m(sharedauthenticate,candidateonboardgetMyOnboardingDetail))
router.patch("/api/v1/candidate/onboard/:onboardingId",m(sharedauthenticate,candidateonboardupdateMyOnboarding))
router.post("/api/v1/candidate/jobs/:jobId/apply",m(sharedauthenticate,(ctx: Context) => candidatejobsapply(ctx, {
  "mode": "candidate"
}),(ctx: Context) => quotascheckQuota(ctx, {
  "target": "jobapplicant"
}),jobsgeminiAiEvaluation))
router.get("/api/v1/candidate/myCVs",m(sharedauthenticate,candidatemyCVs))
router.patch("/api/v1/candidate/cv/:cvId",m(sharedauthenticate,candidateupdateCV))
router.delete("/api/v1/candidate/cv/:cvId",m(sharedauthenticate,candidatedeleteCV))
router.get("/api/v1/candidate/jobs/:jobId",m(sharedauthenticate,candidatejobsgetOnePublicJob))
router.get("/api/v1/candidate/my-applications/:applicationId",m(sharedauthenticate,candidateapplicationDetail))
router.get("/api/v1/candidate/my-meetings",m(sharedauthenticate,meetingsgetMyMeetings))
router.post("/api/v1/meeting",m(meetingsmeetingSignature))
router.post("/api/v1/upload/public",m(sharedauthenticate,uploadpublicUpload))
router.get("/api/v1/upload/readFile/:fileKey",m(sharedauthenticate,uploadreadFile))
router.post("/api/v1/upload/public/tenantLogoForCompany",m(uploadpublicUploadTenantLogo))
router.get("/api/v1/upload/cv/:cvId",m(uploadreadCV))
router.get("/api/v1/upload/video/:fileKey",m(uploadreadVideo))
router.get("/api/v1/upload/video-presigned-url/:fileKey",m(sharedauthenticate,uploadgetVideoPresignedUrl))
router.post("/api/v1/upload/cv",m(sharedauthenticate,uploadprivateUpload,uploaduploadCV))
router.post("/api/v1/upload/private",m(sharedauthenticate,uploadprivateUpload))
router.post("/api/v1/upload/generate-presigned-url",m(sharedauthenticate,uploadgeneratePresignedUrl))
router.post("/api/v1/upload/transcribe-video",m(sharedauthenticate,uploadtranscribeVideoFromR2))
router.post("/api/v1/candidate/autoFill/:fileKey",m(sharedauthenticate,uploadreadFile,candidatecvAutoFillautoFill,uploadjsonToAutoFill))
router.get("/api/v1/candidate/educations",m(sharedauthenticate,candidateeducationsmyEducations))
router.post("/api/v1/candidate/educations",m(sharedauthenticate,candidateeducationscreateEducation))
router.patch("/api/v1/candidate/educations/:educationId",m(sharedauthenticate,candidateeducationsupdateEducation))
router.get("/api/v1/candidate/educations/:educationId",m(sharedauthenticate,candidateeducationsgetOneEducation))
router.delete("/api/v1/candidate/educations/:educationId",m(sharedauthenticate,candidateeducationsdeleteEducation))
router.get("/api/v1/candidate/experiences",m(sharedauthenticate,candidateexperiencesmyExperiences))
router.post("/api/v1/candidate/experiences",m(sharedauthenticate,candidateexperiencescreateExperience))
router.get("/api/v1/candidate/experiences/:experienceId",m(sharedauthenticate,candidateexperiencesgetOneExperience))
router.patch("/api/v1/candidate/experiences/:experienceId",m(sharedauthenticate,candidateexperiencesupdateExperience))
router.delete("/api/v1/candidate/experiences/:experienceId",m(sharedauthenticate,candidateexperiencesdeleteExperience))
router.get("/api/v1/candidate/certificates",m(sharedauthenticate,candidatecertificatesmyCertificates))
router.post("/api/v1/candidate/certificates",m(sharedauthenticate,candidatecertificatescreateCertificate))
router.get("/api/v1/candidate/certificates/:certificateId",m(sharedauthenticate,candidatecertificatesgetOneCertificate))
router.patch("/api/v1/candidate/certificates/:certificateId",m(sharedauthenticate,candidatecertificatesupdateCertificate))
router.delete("/api/v1/candidate/certificates/:certificateId",m(sharedauthenticate,candidatecertificatesdeleteCertificate))
router.get("/api/v1/candidate/languages",m(sharedauthenticate,candidatelanguagesmyLanguages))
router.post("/api/v1/candidate/languages",m(sharedauthenticate,candidatelanguagescreateLanguage))
router.get("/api/v1/candidate/languages/:languageId",m(sharedauthenticate,candidatelanguagesgetOneLanguage))
router.patch("/api/v1/candidate/languages/:languageId",m(sharedauthenticate,candidatelanguagesupdateLanguage))
router.delete("/api/v1/candidate/languages/:languageId",m(sharedauthenticate,candidatelanguagesdeleteLanguage))
router.get("/api/v1/candidate/skills",m(sharedauthenticate,candidateskillsmySkills))
router.post("/api/v1/candidate/skills",m(sharedauthenticate,candidateskillscreateSkill))
router.get("/api/v1/candidate/skills/:skillId",m(sharedauthenticate,candidateskillsgetOneSkill))
router.patch("/api/v1/candidate/skills/:skillId",m(sharedauthenticate,candidateskillsupdateSkill))
router.delete("/api/v1/candidate/skills/:skillId",m(sharedauthenticate,candidateskillsdeleteSkill))
router.get("/api/v1/tenants/:tenantId/educations",m(sharedauthenticate,sharedcheckTenant,candidateeducationsgetAllEducationsOfTenant))
router.get("/api/v1/tenants/:tenantId/candidates",m(sharedauthenticate,sharedcheckTenant,candidatesgetAllCandidatesOfTenant))
router.get("/api/v1/tenants/:tenantId/candidates/:candidateId",m(sharedauthenticate,sharedcheckTenant,candidatesgetOneCandidateOfTenant))
router.get("/api/v1/tenants/:tenantId/candidates/:candidateId/interviews/answersByType",m(sharedauthenticate,sharedcheckTenant,candidateInterviewgetAnswersByType))
router.get("/api/v1/tenants/:tenantId/candidateAnswers/:candidateAnswerId/batchVideoEvaluation",m(sharedauthenticate,sharedcheckTenant,candidateInterviewgetBatchVideoEvaluation))
router.get("/api/v1/tenants/:tenantId/archiveCandidates/:candidateId",m(sharedauthenticate,sharedcheckTenant,candidatesgetOneArchiveCandidateOfTenant))
router.get("/api/v1/tenants/:tenantId/candidates/:candidateId/cv",m(sharedauthenticate,sharedcheckTenant,candidatesgetAllCVsOfCandidate))
router.get("/api/v1/tenants/:tenantId/candidates/:candidateId/comments",m(sharedauthenticate,sharedcheckTenant,candidatescommentsgetAllCommentsOfCandidate))
router.post("/api/v1/tenants/:tenantId/candidates/:candidateId/comments",m(sharedauthenticate,sharedcheckTenant,candidatescommentscreateComment))
router.get("/api/v1/tenants/:tenantId/candidates/:candidateId/comments/:commentId",m(sharedauthenticate,sharedcheckTenant,candidatescommentsgetCommentOfCandidate))
router.patch("/api/v1/tenants/:tenantId/candidates/:candidateId/comments/:commentId",m(sharedauthenticate,sharedcheckTenant,sharedcheckUserPermission))
router.delete("/api/v1/tenants/:tenantId/candidates/:candidateId/comments/:commentId",m(sharedauthenticate,sharedcheckTenant,candidatescommentsdeleteComment))
router.get("/api/v1/auth/logout",m(sharedauthenticate,authlogout))
router.post("/api/v1/auth/forgot-password",m(authforgotPassword))
router.post("/api/v1/auth/changePassword",m(authchangePassword))
router.post("/api/v1/auth/login",m(authlogin))
router.post("/api/v1/auth/register",m(authregister))
router.post("/api/v1/sendSmsOTP",m(authsendSmsOTP))
router.post("/api/v1/auth/checkUserPassword",m(authcheckUserPassword))
router.post("/api/v1/auth/verifyCode",m(authverifyCode))
router.post("/api/v1/verifySmsOTP",m(authverifySmsOTP))
router.post("/api/v1/oauth/exchange",m(authoauthExchange))
router.post("/api/v1/oauth/authorize",m(sharedauthenticate,authoauth))
router.post("/api/v1/auth/google",m(authgoogle))
router.post("/api/v1/auth/google/callback",m(authgoogleCallback))
router.post("/api/v1/auth/linkedin",m(authLinkedin))
router.post("/api/v1/auth/linkedin/callback",m(authLinkedinCallback))
router.get("/api/v1/outsideJobs",m(outsideJobsfetchJobs))
router.get("/api/v1/outsideJobs/:id",m(outsideJobsfetchJobById))
router.get("/api/v1/tenants/:tenantId/onboardingworkflows",m(sharedauthenticate,sharedcheckTenant,onboardingworkflowsfindAll))
router.post("/api/v1/tenants/:tenantId/onboardingworkflows/:id/assign",m(sharedauthenticate,sharedcheckTenant,onboardingworkflowsassignToUser))
router.get("/api/v1/tenants/:tenantId/onboardingworkflows/:id",m(sharedauthenticate,sharedcheckTenant,onboardingworkflowsfind))
router.post("/api/v1/tenants/:tenantId/onboardingworkflows",m(sharedauthenticate,sharedcheckTenant,onboardingworkflowscreate))
router.patch("/api/v1/tenants/:tenantId/onboardingworkflows/:id",m(sharedauthenticate,sharedcheckTenant,onboardingworkflowsupdate))
router.delete("/api/v1/tenants/:tenantId/onboardingworkflows/:id",m(sharedauthenticate,sharedcheckTenant,onboardingworkflowsdelete))
router.get("/api/v1/tenants/:tenantId/onboardingresponses",m(sharedauthenticate,sharedcheckTenant,onboardingresponsesfindAll))
router.post("/api/v1/tenants/:tenantId/onboardingresponses/:id/change-status",m(sharedauthenticate,sharedcheckTenant,onboardingresponseschangeStatus))
router.get("/api/v1/tenants/:tenantId/onboardingresponses/:id",m(sharedauthenticate,sharedcheckTenant,onboardingresponsesfind))
router.post("/api/v1/tenants/:tenantId/onboardingresponses",m(sharedauthenticate,sharedcheckTenant,onboardingresponsescreate))
router.patch("/api/v1/tenants/:tenantId/onboardingresponses/:id",m(sharedauthenticate,sharedcheckTenant,onboardingresponsesupdate))
router.delete("/api/v1/tenants/:tenantId/onboardingresponses/:id",m(sharedauthenticate,sharedcheckTenant,onboardingresponsesdelete))
router.get("/api/v1/tenants/:tenantId/employees",m(sharedauthenticate,sharedcheckTenant,employeesgetAllEmployeesOfTenant))
router.get("/api/v1/tenants/:tenantId/profile/getMyEmployeeData",m(sharedauthenticate,sharedcheckTenant,employeesgetMyEmployeeData))
router.post("/api/v1/tenants/:tenantId/employees",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_employees"
  ],
  "resource": {
    "tenantId": true
  }
}),employeescreateEmployee))
router.get("/api/v1/tenants/:tenantId/employees/:employeeId",m(sharedauthenticate,sharedcheckTenant,employeesgetEmployee))
router.patch("/api/v1/tenants/:tenantId/employees/:employeeId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_employees"
  ],
  "resource": {
    "tenantId": true
  }
}),employeesupdateEmployee))
router.delete("/api/v1/tenants/:tenantId/employees/:employeeId",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => sharedcheckUserPermission(ctx, {
  "scopes": [
    "manage_employees"
  ],
  "resource": {
    "tenantId": true
  }
}),employeesdeleteEmployee))
router.get("/api/v1/tenants/:tenantId/applicants",m(sharedauthenticate,sharedcheckTenant,applicantsfetchApplicants))
router.get("/api/v1/tenants/:tenantId/applicants/:jobId/candidate/:candidateId",m(sharedauthenticate,sharedcheckTenant,applicantsapplicantDetail))
router.patch("/api/v1/tenants/:tenantId/applicants/:jobId",m(sharedauthenticate,sharedcheckTenant,applicantsupdate))
router.get("/api/v1/tenants/:tenantId/mails",m(sharedauthenticate,sharedcheckTenant,mailsfindAll))
router.get("/api/v1/tenants/:tenantId/candidate-mails",m(sharedauthenticate,sharedcheckTenant,mailsfindAllOfCandidate))
router.get("/api/v1/tenants/:tenantId/mails/:id",m(sharedauthenticate,sharedcheckTenant,mailsfind))
router.get("/api/v1/tenants/:tenantId/mails/:mailId/attachments",m(sharedauthenticate,sharedcheckTenant,mailsdownloadAttachment))
router.post("/api/v1/tenants/:tenantId/mails",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => quotascheckQuota(ctx, {
  "target": "email"
}),mailscreate))
router.post("/api/v1/tenants/:tenantId/mails/action",m(sharedauthenticate,sharedcheckTenant,mailsaction))
router.delete("/api/v1/tenants/:tenantId/mails/:id",m(sharedauthenticate,sharedcheckTenant,mailsdelete))
router.post("/api/v1/tenants/:tenantId/mailAnotherJob",m(sharedauthenticate,sharedcheckTenant,mailssendMailAnotherJob))
router.get("/api/v1/tenants/:tenantId/candidates/:candidateId/evaluations",m(sharedauthenticate,sharedcheckTenant,candidatesevaluationsgetAll))
router.post("/api/v1/tenants/:tenantId/candidates/:candidateId/evaluations",m(sharedauthenticate,sharedcheckTenant,candidatesevaluationscreate))
router.get("/api/v1/tenants/:tenantId/candidates/:candidateId/evaluations/:evaluationId",m(sharedauthenticate,sharedcheckTenant,candidatesevaluationsgetOne))
router.patch("/api/v1/tenants/:tenantId/candidates/:candidateId/evaluations/:evaluationId",m(sharedauthenticate,sharedcheckTenant,candidatesevaluationsupdate))
router.delete("/api/v1/tenants/:tenantId/candidates/:candidateId/evaluations/:evaluationId",m(sharedauthenticate,sharedcheckTenant,candidatesevaluationsdelete))
router.get("/api/v1/tenants/:tenantId/candidate-onboardings",m(sharedauthenticate,sharedcheckTenant,candidatesonboardingsgetAll))
router.get("/api/v1/tenants/:tenantId/candidate-onboardings/:onboardingId",m(sharedauthenticate,sharedcheckTenant,candidatesonboardingsgetOne))
router.post("/api/v1/tenants/:tenantId/candidate-onboardings",m(sharedauthenticate,sharedcheckTenant,candidatesonboardingscreate))
router.get("/api/v1/tenants/:tenantId/evaluationTemplates",m(sharedauthenticate,sharedcheckTenant,evaluationTemplatesgetAllOfTenant))
router.post("/api/v1/tenants/:tenantId/evaluationTemplates",m(sharedauthenticate,sharedcheckTenant,evaluationTemplatescreate))
router.get("/api/v1/tenants/:tenantId/evaluationTemplates/:evaluationTemplateId",m(sharedauthenticate,sharedcheckTenant,evaluationTemplatesgetOneOfTenant))
router.patch("/api/v1/tenants/:tenantId/evaluationTemplates/:evaluationTemplateId",m(sharedauthenticate,sharedcheckTenant,evaluationTemplatesupdate))
router.delete("/api/v1/tenants/:tenantId/evaluationTemplates/:evaluationTemplateId",m(sharedauthenticate,sharedcheckTenant,evaluationTemplatesdelete))
router.get("/api/v1/admin/:adminTenantId/postingChannels",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminpostingChannelsgetAllOfAdminTenant))
router.get("/api/v1/admin/:adminTenantId/tenants/:tenantId/postingChannels",m(sharedauthenticate,sharedcheckAdminTenant,adminpostingChannelsgetAllByTenantId))
router.get("/api/v1/admin/:adminTenantId/candidates",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,admincandidatesgetAllCandidatesOfAdminTenant))
router.get("/api/v1/admin/:adminTenantId/tenants/:tenantId/candidates",m(sharedauthenticate,sharedcheckAdminTenant,admincandidatesgetAllCandidatesOfTenant))
router.get("/api/v1/admin/:adminTenantId/candidates/:candidateId",m(sharedauthenticate,sharedcheckAdminTenant,admincandidatesgetById))
router.get("/api/v1/admin/:adminTenantId/candidates/profile/:userId",m(sharedauthenticate,sharedcheckAdminTenant,admincandidatesgetCandidateProfile))
router.patch("/api/v1/admin/:adminTenantId/candidates/profile/:userId",m(sharedauthenticate,sharedcheckAdminTenant,admincandidatesupdateCandidateProfile))
router.get("/api/v1/admin/:adminTenantId/tenants/:tenantId/employees",m(sharedauthenticate,sharedcheckAdminTenant,adminemployeesgetAllEmployeesByTenantId))
router.get("/api/v1/admin/:adminTenantId/tenants/:tenantId/recruitmentStages",m(sharedauthenticate,sharedcheckAdminTenant,recruitmentStagesgetAllRecruitmentStagesOfTenant))
router.get("/api/v1/admin/:adminTenantId/jobs",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminjobsgetAllJobsOfAdminTenant))
router.get("/api/v1/admin/:adminTenantId/tenants/:tenantId/jobs",m(sharedauthenticate,sharedcheckAdminTenant,jobsgetAllJobsOfTenant))
router.get("/api/v1/admin/:adminTenantId/jobs/:jobId",m(sharedauthenticate,sharedcheckAdminTenant,adminjobsgetById))
router.get("/api/v1/admin/:adminTenantId/jobs/:jobId/applications",m(sharedauthenticate,sharedcheckAdminTenant,adminjobsgetApplicationsOfJob))
router.post("/api/v1/admin/:adminTenantId/tenants/:tenantId/jobs",m(sharedauthenticate,sharedcheckAdminTenant,jobscreateJob))
router.patch("/api/v1/admin/:adminTenantId/jobs/:jobId",m(sharedauthenticate,sharedcheckAdminTenant,adminjobsupdateJob))
router.delete("/api/v1/admin/:adminTenantId/tenants/:tenantId/jobs/:jobId",m(sharedauthenticate,sharedcheckAdminTenant,adminjobsdeleteJob))
router.get("/api/v1/admin/:adminTenantId/tenants",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,admintenantsgetAllTenantsOfAdminTenant))
router.get("/api/v1/admin/:adminTenantId/tenants/all",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,admintenantsgetAllTenantsList))
router.patch("/api/v1/admin/:adminTenantId/tenants/:tenantId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,admintenantsupdateOneTenant))
router.get("/api/v1/admin/:adminTenantId/postingChannels",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminpostingChannelsgetAllOfAdminTenant))
router.get("/api/v1/admin/:adminTenantId/tenants/:tenantId/postingChannels",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminpostingChannelsgetAllByTenantId))
router.get("/api/v1/admin/:adminTenantId/postingChannels/:channelId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminpostingChannelsgetOne))
router.post("/api/v1/admin/:adminTenantId/postingChannels",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminpostingChannelscreate))
router.post("/api/v1/admin/:adminTenantId/postingChannels/populate",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminpostingChannelspopulatePostingChannels))
router.patch("/api/v1/admin/:adminTenantId/postingChannels/:channelId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminpostingChannelsupdate))
router.delete("/api/v1/admin/:adminTenantId/postingChannels/:channelId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminpostingChannelsdelete))
router.get("/api/v1/admin/:adminTenantId/applications",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminapplicationsfetchApplications))
router.post("/api/v1/admin/:adminTenantId/applications",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,(ctx: Context) => candidatejobsapply(ctx, {
  "mode": "admin"
})))
router.post("/api/v1/profile/create",m(profilecreateProfile))
router.get("/api/v1/profile/getMe",m(sharedauthenticate,profilegetMe))
router.patch("/api/v1/profile/updateMe",m(sharedauthenticate,profileupdateMe))
router.get("/api/v1/profile/tenants",m(sharedauthenticate,profiletenantsOfUser))
router.get("/api/v1/profile/postingChannels/:tenantId",m(sharedauthenticate,profilepostingChannelsOfUser))
router.get("/api/v1/profile/listManageablePostingChannels",m(sharedauthenticate,profilelistManageablePostingChannelsOfUser))
router.get("/api/v1/profile/permissions",m(sharedauthenticate,profilepermissionsOfUser))
router.get("/api/v1/tenants",m(sharedauthenticate,tenantsgetAllTenants))
router.post("/api/v1/tenants",m(sharedauthenticate,tenantscreateOneTenant,tenantColordetermineTenantColor))
router.post("/api/v1/tenants/createTeantForCompany",m(tenantscreateTenantForCompany,tenantColordetermineTenantColor))
router.post("/api/v1/tenants/parentTenant",m(tenantscreateCompanyTenant))
router.get("/api/v1/tenants/infoByDomain/:domain",m(tenantsgetTenantInfoByDomain))
router.get("/api/v1/tenants/:tenantId",m(sharedauthenticate,tenantsgetOneTenant))
router.patch("/api/v1/tenants/:tenantId/qr",m(sharedauthenticate,tenantstenantQr))
router.patch("/api/v1/tenants/:tenantId",m(sharedauthenticate,tenantsupdateOneTenant))
router.delete("/api/v1/tenants/:tenantId",m(sharedauthenticate,tenantsdeleteOneTenant))
router.get("/api/v1/tenants/:tenantId/members",m(sharedauthenticate,tenantsmembersgetAllMembersOfTenant))
router.post("/api/v1/tenants/:tenantId/members",m(sharedauthenticate,tenantsmembersinviteMemberToTenant))
router.post("/api/v1/tenants/:tenantId/members/resend",m(sharedauthenticate,tenantsmembersresendCreateProfileEmail))
router.get("/api/v1/tenants/:tenantId/members/:memberId",m(sharedauthenticate,tenantsmembersgetMemberOfTenant))
router.delete("/api/v1/tenants/:tenantId/members/:memberId",m(sharedauthenticate,tenantsmembersremoveMemberFromTenant))
router.patch("/api/v1/tenants/:tenantId/members/:memberId",m(sharedauthenticate,tenantsmembersupdateOneMember))
router.get("/api/v1/tenants/:tenantId/members/:memberId/permissions",m(sharedauthenticate,permissionscheckPermissionListAccess,permissionsgetMemberPermissions))
router.post("/api/v1/tenants/:tenantId/members/:memberId/permissions",m(sharedauthenticate,permissionscheckPermissionManageAccess,permissionsmanagePermissionsOfUser))
router.get("/healthyCheck",m(healthyCheckhealthyCheck))
router.post("/api/v1/tenants/:tenantId/emailTemplates",m(sharedauthenticate,emailTemplatescreate))
router.get("/api/v1/tenants/:tenantId/emailTemplates",m(sharedauthenticate,emailTemplatesgetAll))
router.get("/api/v1/tenants/:tenantId/emailTemplates/:id",m(sharedauthenticate,emailTemplatesgetOne))
router.delete("/api/v1/tenants/:tenantId/emailTemplates/:id",m(sharedauthenticate,emailTemplatesdelete))
router.patch("/api/v1/tenants/:tenantId/emailTemplates/:id",m(sharedauthenticate,emailTemplatesupdate))
router.post("/api/v1/tenants/:tenantId/disqualifyEmailTemplates",m(sharedauthenticate,disqualifyEmailTemplatescreate))
router.get("/api/v1/tenants/:tenantId/disqualifyEmailTemplates",m(sharedauthenticate,disqualifyEmailTemplatesgetOne))
router.delete("/api/v1/tenants/:tenantId/disqualifyEmailTemplates/:id",m(sharedauthenticate,disqualifyEmailTemplatesdelete))
router.patch("/api/v1/tenants/:tenantId/disqualifyEmailTemplates/:id",m(sharedauthenticate,disqualifyEmailTemplatesupdate))
router.get("/api/v1/categories",m(categoriesgetAllCategory))
router.get("/api/v1/categories/:categoryId/jobs",m(categoriesgetAllJobsOfCategory))
router.post("/api/v1/tenantCategories",m(sharedauthenticate,categoriescreateTenantCategory))
router.post("/api/v1/admin/:adminTenantId/categories",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,admincategoriescreateCategory))
router.patch("/api/v1/admin/:adminTenantId/categories/:categoryId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,admincategoriesupdateCategory))
router.delete("/api/v1/admin/:adminTenantId/categories/:categoryId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,admincategoriesdeleteCategory))
router.post("/api/v1/admin/:adminTenantId/users",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminuserscreate))
router.patch("/api/v1/admin/:adminTenantId/users/:userId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersupdateOneUser))
router.get("/api/v1/admin/:adminTenantId/users",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersgetAll))
router.get("/api/v1/admin/:adminTenantId/users/:userId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersgetById))
router.get("/api/v1/admin/:adminTenantId/users/:userId/experiences",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersgetUserExperiences))
router.post("/api/v1/admin/:adminTenantId/users/:userId/experiences",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminuserscreateUserExperience))
router.delete("/api/v1/admin/:adminTenantId/users/:userId/experiences/:experienceId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersdeleteUserExperience))
router.patch("/api/v1/admin/:adminTenantId/users/:userId/experiences/:experienceId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersupdateUserExperience))
router.get("/api/v1/admin/:adminTenantId/users/:userId/educations",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersgetUserEducations))
router.patch("/api/v1/admin/:adminTenantId/users/:userId/educations/:educationId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersupdateUserEducation))
router.delete("/api/v1/admin/:adminTenantId/users/:userId/educations/:educationId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersdeleteUserEducation))
router.post("/api/v1/admin/:adminTenantId/users/:userId/educations",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminuserscreateUserEducation))
router.get("/api/v1/admin/:adminTenantId/users/:userId/certificates",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersgetUserCertificates))
router.patch("/api/v1/admin/:adminTenantId/users/:userId/certificates/:certificateId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersupdateUserCertificate))
router.delete("/api/v1/admin/:adminTenantId/users/:userId/certificates/:certificateId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersdeleteUserCertificate))
router.post("/api/v1/admin/:adminTenantId/users/:userId/certificates",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminuserscreateUserCertificate))
router.get("/api/v1/admin/:adminTenantId/users/:userId/languages",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersgetUserLanguages))
router.patch("/api/v1/admin/:adminTenantId/users/:userId/languages/:languageId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersupdateUserLanguage))
router.delete("/api/v1/admin/:adminTenantId/users/:userId/languages/:languageId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersdeleteUserLanguage))
router.post("/api/v1/admin/:adminTenantId/users/:userId/languages",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminuserscreateUserLanguage))
router.get("/api/v1/admin/:adminTenantId/users/:userId/skills",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersgetUserSkills))
router.patch("/api/v1/admin/:adminTenantId/users/:userId/skills/:skillId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersupdateUserSkill))
router.delete("/api/v1/admin/:adminTenantId/users/:userId/skills/:skillId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersdeleteUserSkill))
router.post("/api/v1/admin/:adminTenantId/users/:userId/skills",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminuserscreateUserSkill))
router.post("/api/v1/admin/:adminTenantId/users/:userId/cv",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,uploadprivateUpload,adminuserscreateUserCv))
router.get("/api/v1/admin/:adminTenantId/users/:userId/cvs",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersgetUserCvs))
router.delete("/api/v1/admin/:adminTenantId/users/:userId/cvs/:cvId",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminusersdeleteUserCv))
router.get("/api/v1/notifications",m(sharedauthenticate,notificationsgetAllNotifications))
router.patch("/api/v1/notifications/markAsRead",m(sharedauthenticate,notificationsmarkAsRead))
router.delete("/api/v1/notifications/:notificationId",m(sharedauthenticate,notificationsdeleteNotification))
router.get("/api/v1/countries",m(countrygetCountries))
router.get("/api/v1/country/:id",m(countrygetCountry))
router.patch("/api/v1/checkJobEndDateCronJob",m(croncheckJobEndDateCronJob))
router.patch("/api/v1/sendDisqualifyMailCronJob",m(cronsendDisqualifyMailCronJob))
router.patch("/api/v1/parseMailCronJob",m(cronparseMailCronJob))
router.delete("/api/v1/users/:userId",m(sharedauthenticate,usersdeleteUserOfTenantMembers))
router.post("/api/v1/tenants/:tenantId/aievaluation/:fileKey",m(sharedauthenticate,(ctx: Context) => quotascheckQuota(ctx, {
  "target": "evaluation"
}),uploadreadFile,aievaluationcreate))
router.get("/api/v1/tenants/:tenantId/aievaluation/candidate/:candidateId/job/:jobId",m(sharedauthenticate,aievaluationgetone))
router.get("/api/v1/tenants/:tenantId/aievaluation",m(sharedauthenticate,aievaluationgetall))
router.post("/api/v1/tenants/:tenantId/archiveAievaluation/:fileKey",m(sharedauthenticate,uploadreadFile,achiveAievaluationcreate))
router.get("/api/v1/tenants/:tenantId/archiveAievaluation/candidate/:candidateId/job/:jobId",m(sharedauthenticate,achiveAievaluationgetOneArchiveAiEvaluation))
router.get("/api/v1/tenants/:tenantId/interviews/:jobId",m(sharedauthenticate,sharedcheckTenant,jobsgetAiInterviewById))
router.patch("/api/v1/tenants/:tenantId/interviews/:jobId",m(sharedauthenticate,sharedcheckTenant,jobsupdateAiInterview))
router.get("/api/v1/tenants/:tenantId/interviewsAnswers/:interviewAnswerId/applicant/:applicantId",m(sharedauthenticate,sharedcheckTenant,jobsgetTenantofInterviewAnswer))
router.get("/api/v1/tenants/:tenantId/interviewsAnswers/:interviewAnswerId/applicant/:applicantId/getAll",m(sharedauthenticate,sharedcheckTenant,jobsgetTenantofInterviewAnswergetAll))
router.post("/api/v1/whatsapp-webhook",m(whatsappsendwhatsappWebhook))
router.get("/api/v1/whatsapp-webhook",m(whatsappwhatsappWebhook))
router.post("/api/v1/generate-questions",m(personaltestcreate))
router.post("/api/v1/evaluate-answers",m(personaltestanswer))
router.get("/api/v1/candidates/:candidateId/personaltest",m(personaltestfind))
router.get("/api/v1/determineTenantColor/:tenant",m(tenantColordetermineTenantColor))
router.post("/api/v1/tenants/:tenantId/jobs/:jobId/application/candidateBlackList",m(sharedauthenticate,candidateBlackListscandidateBlackList))
router.post("/api/v1/tenants/:tenantId/candidateBlackList",m(sharedauthenticate,candidateBlackListsremoveCandidateBlackList))
router.get("/api/v1/tenants/:tenantId/quota",m(sharedauthenticate,sharedcheckTenant,quotasgetQuota))
router.post("/api/v1/uploadAutoFill/cv",m(uploadpublicUploadForAutoFill,uploaduploadParseCV))
router.post("/api/v1/applicationJob/applicationJobWithoutRegister",m(jobsapplicationWithoutRegister,(ctx: Context) => quotascheckQuota(ctx, {
  "target": "jobapplicant"
}),jobsgeminiAiEvaluation))
router.get("/api/v1/admin/:adminTenantId/tenants/:tenantId/quotas",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminquotasgetTenantQuotas))
router.patch("/api/v1/admin/:adminTenantId/tenants/:tenantId/quotas",m(sharedauthenticate,sharedcheckAdminTenant,sharedcheckAdminPermission,adminquotasupdateTenantQuotas))
router.post("/api/v1/telegram-bot",m(telegramBottelegramBot))
router.get("/api/v1/tenants/:tenantId/interviews",m(sharedauthenticate,sharedcheckTenant,cinterviewgetAllInterview))
router.get("/api/v1/tenants/:tenantId/jobId/:jobId/jobApplicationId/:jobApplicationId/listanswers",m(sharedauthenticate,sharedcheckTenant,candidateInterviewgetTenantInterviewanswers))
router.get("/api/v1/tenants/:tenantId/candidateAnswersId/:candidateAnswerId",m(sharedauthenticate,sharedcheckTenant,candidateInterviewgetInterviewAnswers))
router.post("/api/v1/tenants/:tenantId/interviews",m(sharedauthenticate,sharedcheckTenant,cinterviewcreateInterview))
router.delete("/api/v1/tenants/:tenantId/interviews/:interviewId",m(sharedauthenticate,sharedcheckTenant,cinterviewdeleteInterview))
router.patch("/api/v1/tenants/:tenantId/interviews/:interviewId/interviewQuestions",m(sharedauthenticate,sharedcheckTenant,interviewQuestionsupdateInterviewQuestions))
router.get("/api/v1/tenants/:tenantId/interviews/:interviewId/interviewQuestions",m(sharedauthenticate,sharedcheckTenant,interviewQuestionsgetinterviewQuestions))
router.post("/api/v1/tenants/:tenantId/job/:jobId/createInterviewQuestion",m(sharedauthenticate,sharedcheckTenant,interviewQuestionscreateInterviewQuestionWithJob))
router.post("/api/v1/tenants/:tenantId/createInterviewQuestion",m(sharedauthenticate,sharedcheckTenant,interviewQuestionscreateInterviewQuestionWithText))
router.post("/api/v1/tenants/:tenantId/createInterviewQuestion",m(sharedauthenticate,sharedcheckTenant,interviewQuestionscreateInterviewQuestionWithText))
router.patch("/api/v1/tenants/:tenantId/interviews/:interviewId/question/:questionId/quesitonToVoice",m(sharedauthenticate,sharedcheckTenant,interviewQuestionsquestionToSpeech))
router.post("/api/v1/tenants/:tenantId/jobs/:jobId/jobApplication/:applicationId/candidateInvitation",m(sharedauthenticate,sharedcheckTenant,(ctx: Context) => quotascheckQuota(ctx, {
  "target": "interview"
}),cinterviewinterviewInvitation))
router.get("/api/v1/candidateInterview",m(sharedauthenticate,candidateInterviewgetAllCandidateInterview))
router.get("/api/v1/candidateInterview/:interviewId",m(sharedauthenticate,candidateInterviewgetOneCandidateInterview))
router.get("/api/v1/candidateInterviewQuestion/:interviewId",m(sharedauthenticate,candidateInterviewgetCandidateInterviewQuestion))
router.patch("/api/v1/candidateInterview/:interviewId",m(sharedauthenticate,candidateInterviewupdateCandidateInterview))
router.get("/api/v1/candidateAnswers/:candidateAnswerId",m(sharedauthenticate,candidateAnswersgetCandidateAnswers))
router.patch("/api/v1/candidateAnswers/:candidateAnswerId",m(sharedauthenticate,candidateAnswersupdateCandidateAnswers))
router.patch("/api/v1/candidateVideoAnswers/:candidateAnswerId",m(sharedauthenticate,candidateAnswersupdateCandidateVideoAnswers))
router.patch("/api/v1/candidateInterview/:interviewId/interviewlogs",m(sharedauthenticate,candidateInterviewinterviewLogs))
router.patch("/api/v1/tenants/:tenantId/interview/:interviewId/candidateAnswers/:candidateAnswersId/videoInterviewEvaluation",m(sharedauthenticate,sharedcheckTenant,candidateInterviewevaluateCandidateVideoInterview))
router.patch("/api/v1/tenants/:tenantId/interview/:interviewId/candidateAnswers/:candidateAnswersId/textInterviewEvaluation",m(sharedauthenticate,sharedcheckTenant,candidateInterviewevaluateCandidateTextInterview))
router.get("/api/v1/tenants/:tenantId/quiz-questions",m(sharedauthenticate,sharedcheckTenant,quizQuestionsgetAllQuestions))
router.post("/api/v1/tenants/:tenantId/quiz-questions",m(sharedauthenticate,sharedcheckTenant,quizQuestionscreateQuestion))
router.get("/api/v1/tenants/:tenantId/quiz-questions/:questionId",m(sharedauthenticate,sharedcheckTenant,quizQuestionsgetQuestionById))
router.put("/api/v1/tenants/:tenantId/quiz-questions/:questionId",m(sharedauthenticate,sharedcheckTenant,quizQuestionsupdateQuestion))
router.delete("/api/v1/tenants/:tenantId/quiz-questions/:questionId",m(sharedauthenticate,sharedcheckTenant,quizQuestionsdeleteQuestion))
router.get("/api/v1/tenants/:tenantId/quiz-questions/category/:categoryId",m(sharedauthenticate,sharedcheckTenant,quizQuestionsgetQuestionsByCategory))
router.get("/api/v1/tenants/:tenantId/quiz-questions/random",m(sharedauthenticate,sharedcheckTenant,quizQuestionsgetRandomQuestions))
router.get("/api/v1/tenants/:tenantId/quiz-questions/statistics",m(sharedauthenticate,sharedcheckTenant,quizQuestionsgetQuestionStats))
router.patch("/api/v1/tenants/:tenantId/quiz-questions/:questionId/toggle",m(sharedauthenticate,sharedcheckTenant,quizQuestionstoggleQuestionStatus))
router.post("/api/v1/tenants/:tenantId/quiz-questions/bulk-import",m(sharedauthenticate,sharedcheckTenant,uploadpublicUpload,quizQuestionsbulkImportQuestions))
router.get("/api/v1/tenants/:tenantId/quiz-questions/excel-template",m(sharedauthenticate,sharedcheckTenant,quizQuestionsdownloadExcelTemplate))
router.post("/api/v1/tenants/:tenantId/quiz-questions/validate-excel",m(sharedauthenticate,sharedcheckTenant,uploadpublicUpload,quizQuestionsvalidateExcelFile))
router.get("/api/v1/tenants/:tenantId/quiz-sets",m(sharedauthenticate,sharedcheckTenant,quizSetsgetAllQuizSets))
router.post("/api/v1/tenants/:tenantId/quiz-sets",m(sharedauthenticate,sharedcheckTenant,quizSetscreateQuizSet))
router.get("/api/v1/tenants/:tenantId/quiz-sets/:quizSetId",m(sharedauthenticate,sharedcheckTenant,quizSetsgetQuizSetById))
router.put("/api/v1/tenants/:tenantId/quiz-sets/:quizSetId",m(sharedauthenticate,sharedcheckTenant,quizSetsupdateQuizSet))
router.delete("/api/v1/tenants/:tenantId/quiz-sets/:quizSetId",m(sharedauthenticate,sharedcheckTenant,quizSetsdeleteQuizSet))
router.patch("/api/v1/tenants/:tenantId/quiz-sets/:quizSetId/toggle",m(sharedauthenticate,sharedcheckTenant,quizSetstoggleQuizSetStatus))
router.post("/api/v1/tenants/:tenantId/quiz-assignments",m(sharedauthenticate,sharedcheckTenant,userQuizAssignmentsassignQuizToUser))
router.get("/api/v1/tenants/:tenantId/quiz-assignments",m(sharedauthenticate,sharedcheckTenant,userQuizAssignmentsgetAllAssignments))
router.get("/api/v1/tenants/:tenantId/users/:userId/quiz-assignments",m(sharedauthenticate,sharedcheckTenant,userQuizAssignmentsgetUserAssignments))
router.get("/api/v1/tenants/:tenantId/quiz-assignments/:assignmentId",m(sharedauthenticate,sharedcheckTenant,userQuizAssignmentsgetAssignmentById))
router.post("/api/v1/tenants/:tenantId/quiz-assignments/:assignmentId/start",m(sharedauthenticate,sharedcheckTenant,userQuizAssignmentsstartQuiz))
router.patch("/api/v1/tenants/:tenantId/quiz-assignments/:assignmentId",m(sharedauthenticate,sharedcheckTenant,userQuizAssignmentsupdateAssignment))
router.delete("/api/v1/tenants/:tenantId/quiz-assignments/:assignmentId",m(sharedauthenticate,sharedcheckTenant,userQuizAssignmentsdeleteAssignment))
router.get("/api/v1/candidate/quiz-assignments",m(sharedauthenticate,candidatequizAssignmentsgetMyQuizAssignments))
router.post("/api/v1/candidate/quiz-assignments/:assignmentId/start",m(sharedauthenticate,candidatequizAssignmentsstartMyQuiz))
router.get("/api/v1/candidate/quiz-sessions/:sessionId",m(sharedauthenticate,candidatequizSessionsgetMyQuizSession))
router.post("/api/v1/candidate/quiz-sessions/:sessionId/answer",m(sharedauthenticate,candidatequizSessionssubmitMyAnswer))
router.post("/api/v1/candidate/quiz-sessions/:sessionId/complete",m(sharedauthenticate,candidatequizSessionscompleteMyQuiz))
router.get("/api/v1/candidate/quiz-sessions/:sessionId/results",m(sharedauthenticate,candidatequizSessionsgetMySessionResults))
router.get("/api/v1/personality-test/check-eligibility",m(sharedauthenticate,personalityTestcheckEligibility))
router.post("/api/v1/personality-test/start",m(sharedauthenticate,personalityTeststartTest))
router.get("/api/v1/personality-test/sessions/:sessionId/current-question",m(sharedauthenticate,personalityTestgetCurrentQuestion))
router.post("/api/v1/personality-test/sessions/:sessionId/answer",m(sharedauthenticate,personalityTestsubmitAnswer))
router.get("/api/v1/tenants/:tenantId/personality-test/sessions/:sessionId/results",m(sharedauthenticate,sharedcheckTenant,personalityTestgetResults))
router.get("/api/v1/tenants/:tenantId/personality-test/history",m(sharedauthenticate,sharedcheckTenant,personalityTestgetUserTestHistory))
router.get("/api/v1/tenants/:tenantId/personality-test/sessions/:sessionId/details",m(sharedauthenticate,sharedcheckTenant,personalityTestgetSessionDetails))
router.post("/api/v1/tenants/:tenantId/interviews/:interviewId/bulk-invitation",m(sharedauthenticate,sharedcheckTenant,cinterviewbulkInterviewInvitation))
export default router
