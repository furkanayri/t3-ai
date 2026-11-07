import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { App } from 'src/app';
import { ProtectedRoute } from 'src/components/Permission';

import { Layout as CompanyLayout } from 'src/layouts/Layout';
import { NotFound } from 'src/notFound';

function CompanyLayoutWithOutlet() {
  return (
    <CompanyLayout>
      <Suspense>
        <Outlet />
      </Suspense>
    </CompanyLayout>
  );
}

// TODO candidate ile alakalı bir permission yok
const Dashboard = React.lazy(() =>
  import('src/pages/CompanyApp/Dashboard/Dashboard').then(module => ({ default: module.Component })));
//jobs
const Jobs = React.lazy(() =>
  import('src/pages/CompanyApp/Jobs/ListJob').then(module => ({ default: module.Component })));
const DetailJob = React.lazy(() =>
  import('src/pages/CompanyApp/Jobs/DetailJob').then(module => ({ default: module.Component })))
const ArchiveDetailJob = React.lazy(() =>
  import('src/pages/CompanyApp/BulkCvUpload/ArchiveDetailJob').then(module => ({ default: module.Component })))
const CreateJob = React.lazy(() =>
  import('src/pages/CompanyApp/Jobs/CreateJob').then(module => ({ default: module.Component })))
//Meeting
const Meetings = React.lazy(() =>
  import('src/pages/CompanyApp/Meetings/List').then(module => ({ default: module.Component })))
const CreateMeetings = React.lazy(() =>
  import('src/pages/CompanyApp/Meetings/Create').then(module => ({ default: module.Component })))
const UpdateMeetings = React.lazy(() =>
  import('src/pages/CompanyApp/Meetings/Edit').then(module => ({ default: module.Component })))
//employees
const Teams = React.lazy(() =>
  import('src/pages/CompanyApp/Teams/TeamsPage').then(module => ({ default: module.Component })))
//mails
const Mail = React.lazy(() =>
  import('src/pages/CompanyApp/Mail').then(module => ({ default: module.Component })))
const SendMail = React.lazy(() =>
  import('src/pages/CompanyApp//Mail/sections/MailDetail').then(module => ({ default: module.Component })))
//bulk-cv-upload
const BulkCvUpload = React.lazy(() =>
  import('src/pages/CompanyApp/BulkCvUpload/CvUploadPage').then(module => ({ default: module.Component })))
//quiz
const QuizQuestions = React.lazy(() =>
  import('src/pages/CompanyApp/Settings/QuizQuestions/QuizQuestion').then(module => ({ default: module.default })))

const InventoryTesting = React.lazy(() =>
  import('src/pages/CompanyApp/InventoryTesting/InventoryTestingList/Inventory-testing').then(module => ({ default: module.Component })))

const DimensionsList = React.lazy(() =>
  import('src/pages/CompanyApp/InventoryTesting/Dimensions/DimensionsList').then(module => ({ default: module.default })))

const InventoryQuestion = React.lazy(() =>
  import('src/pages/CompanyApp/InventoryTesting/InventoryQuestions/inventoryQuestion').then(module => ({ default: module.default })))

const InventoryTest = React.lazy(() =>
  import('src/pages/CompanyApp/InventoryTesting/InventoryTests/InventoryTest').then(module => ({ default: module.default })))


const Inventorytestquestions = React.lazy(() =>
  import('src/pages/CompanyApp/InventoryTesting/inventoryTestQuestions/inventorytestquestions').then(module => ({ default: module.default })))

const CompanyAppRoutes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: ':companySlug',
        element: <CompanyLayoutWithOutlet />,
        children: [
          {
            index: true,
            element: <ProtectedRoute permission="get_metrics" ><Dashboard /></ProtectedRoute>,
          },
          {
            path: 'account',
            lazy: () => import('src/pages/CompanyApp/Account/Account'),
          },
          // {
          //   path: 'jobs',
          //   children: [
          //     {
          //       index: true,
          //       element: <ProtectedRoute permission="manage_jobs" ><Jobs /></ProtectedRoute>,
          //     },
          //     {
          //       path: ':id',
          //       element: <ProtectedRoute permission="manage_jobs" ><DetailJob /></ProtectedRoute>,
          //       children: [
          //         {
          //           index: true,
          //           lazy: () => import('src/pages/CompanyApp/Jobs/DetailJob/JobOverview'),
          //         },
          //         {
          //           path: 'board',
          //           lazy: () => import('src/pages/CompanyApp/Jobs/DetailJob/JobBoard'),
          //         },
          //         {
          //           path: 'all-applicants',
          //           lazy: () => import('src/pages/CompanyApp/Jobs/DetailJob/JobApplicants'),
          //         },
          //         {
          //           path: 'evaluated',
          //           lazy: () => import('src/pages/CompanyApp/Jobs/DetailJob/Evaluated'),
          //         },
          //         {
          //           path: 'onboarding',
          //           lazy: () => import('src/pages/CompanyApp/Jobs/DetailJob/Onboarding'),
          //         },
          //         {
          //           path: 'hired',
          //           lazy: () => import('src/pages/CompanyApp/Jobs/DetailJob/Hired'),
          //         },
          //         /* 
          //           <Route
          //             path="activity"
          //             lazy={() => import('src/pages/CompanyApp/Jobs/DetailJob/JobActivity')}
          //           /> 
          //         */
          //         {
          //           path: 'reports',
          //           lazy: () => import('src/pages/CompanyApp/Jobs/DetailJob/JobReports'),
          //         },
          //         // {
          //         //   path: 'AiEvaluation',
          //         //   lazy: () => import('src/pages/CompanyApp/Jobs/DetailJob/AiEvaluation'),
          //         // },
          //       ],
          //     },
          //     {
          //       path: ':id/edit/general-info',
          //       lazy: () => import('src/pages/CompanyApp/Jobs/EditJob/GeneralInfo'),
          //     },
          //     {
          //       path: ':id/edit/content',
          //       lazy: () => import('src/pages/CompanyApp/Jobs/EditJob/Content'),
          //     },
          //     {
          //       path: ':id/edit/candidate-skills',
          //       lazy: () => import('src/pages/CompanyApp/Jobs/EditJob/SkillsForm'),
          //     },
          //     {
          //       path: ':id/edit/form-definitions',
          //       lazy: () => import('src/pages/CompanyApp/Jobs/EditJob/FormDefinitions'),
          //     },
          //     {
          //       path: ':id/edit/applicant-questions',
          //       lazy: () => import('src/pages/CompanyApp/Jobs/EditJob/ApplicantQuestions'),
          //     },
          //     // {
          //     //   path: ':id/edit/interview-questions',
          //     //   lazy: () => import('src/pages/CompanyApp/Jobs/EditJob/InterviewQuestions'),
          //     // },
          //     {
          //       path: 'create',
          //       element: <ProtectedRoute permission="manage_jobs" ><CreateJob /></ProtectedRoute>,
          //     },
          //   ],
          // },
          // {
          //   path: 'bulk-cv-upload',
          //   children: [
          //     {
          //       index: true,
          //       element: (
          //         <ProtectedRoute permission="manage_employees">
          //           <BulkCvUpload />
          //         </ProtectedRoute>
          //       ),
          //     },
          //     {
          //       path: 'jobs/:id',
          //       element: <ProtectedRoute permission="manage_jobs" ><ArchiveDetailJob /></ProtectedRoute>,
          //       children: [
          //         {
          //           index: true,
          //           lazy: () => import('src/pages/CompanyApp/BulkCvUpload/ArchiveDetailJob/sections/JobOverview'),
          //         },
          //         {
          //           path: 'all-applicants',
          //           lazy: () => import('src/pages/CompanyApp/BulkCvUpload/ArchiveDetailJob/ArchiveJobApplicants'),
          //         },
          //       ],
          //     },

          //   ],
          // },
          // {
          //   path: "mail",
          //   children: [
          //     {
          //       index: true,
          //       element: <ProtectedRoute permission="send_emails" ><Mail /></ProtectedRoute>,
          //     },
          //     {
          //       path: ':mailId',
          //       element: <ProtectedRoute permission="send_emails" ><SendMail /></ProtectedRoute>,
          //       lazy: () => import('src/pages/CompanyApp/Mail/sections/MailDetail'),
          //     },
          //   ],
          // },
          {
            path: 'candidates',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/CompanyApp/Candidates/List'),
              },
              {
                path: 'create',
                lazy: () => import('src/pages/CompanyApp/Candidates/Create'),
              },
            ],
          },
          // {
          //   path: 'meetings',
          //   children: [
          //     {
          //       index: true,
          //       element: <ProtectedRoute permission="manage_meetings" ><Meetings /></ProtectedRoute>,
          //     },
          //     {
          //       path: 'create',
          //       element: <ProtectedRoute permission="manage_meetings" ><CreateMeetings /></ProtectedRoute>,
          //     },
          //     {
          //       path: ':id',
          //       element: <ProtectedRoute permission="manage_meetings" ><UpdateMeetings /></ProtectedRoute>,
          //     },
          //   ],
          // },
          // {
          //   path: 'teams',
          //   element: <ProtectedRoute permission="manage_employees" ><Teams /></ProtectedRoute>,
          // },
          // {
          //   path: 'quiz-questions',
          //   element: <QuizQuestions />,
          // },

          // dianmik olarak envanter testi ile ilgili ön çalışma
          // {
          //   path: 'inventory-testing',
          //   children: [
          //     {
          //       index: true,
          //       element: <ProtectedRoute permission="manage_employees" ><InventoryTesting /></ProtectedRoute>,
          //     },
          //     {
          //       path: 'dimensions',
          //       element: <ProtectedRoute permission="manage_employees" ><DimensionsList /></ProtectedRoute>,
          //     },
          //     {
          //       path: 'inventory-testing-questions',
          //       element: <ProtectedRoute permission="manage_employees" >
          //         <InventoryQuestion />
          //       </ProtectedRoute>,
          //     },
          //     {
          //       path: 'inventory-testing-tests',
          //       element: <ProtectedRoute permission="manage_employees" >
          //         <InventoryTest />
          //       </ProtectedRoute>,
          //     },
          //     {
          //       path: 'inventory-testquestions',
          //       element: <ProtectedRoute permission="manage_employees" >
          //         <Inventorytestquestions />
          //       </ProtectedRoute>,

          //     }
          //   ],
          // }


        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
      {
        path: 'callback',
        lazy: () => import('src/pages/AccountsApp/Auth/Callback'),
      },
      {
        path: 'reset-password',
        lazy: () => import('src/pages/CompanyApp/Auth/ResetPassword'),
      },
      {
        path: 'forgot-password',
        lazy: () => import('src/pages/CompanyApp/Auth/ForgotPassword'),
      },
      {
        path: 'login',
        lazy: () => import('src/pages/CompanyApp/Auth/Login'),
      },

      {
        path: 'register',
        lazy: () => import('src/pages/CompanyApp/Auth/Register'),
      },
      {
        path: "authorize",
        lazy: () => import('src/pages/CompanyApp/Auth/Authorize'),
      },
      {
        path: "create-account",
        lazy: () => import('src/pages/CompanyApp/Auth/CreateAccount'),
      }
    ],
  },
];

export default CompanyAppRoutes;
