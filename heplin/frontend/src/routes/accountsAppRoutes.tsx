import { Suspense } from 'react';
import { Outlet, type RouteObject } from 'react-router';

import { App } from 'src/app';
import { Layout as AccountsLayout } from 'src/layouts/Layout';
import { NotFound } from 'src/notFound';
import InterviewProvider from 'src/pages/AccountsApp/Interviews/InterviewContext/InterviewProvider';

function AccountsLayoutWithOutlet() {
  return (
    <AccountsLayout>
      <Suspense>
        <Outlet />
      </Suspense>
    </AccountsLayout>
  );
}

const AccountsAppRoutes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <AccountsLayoutWithOutlet />,
        children: [
          {
            index: true,
            lazy: () => import('src/pages/AccountsApp/Account'),
          },
          {
            path: 'accept-policies',
            lazy: () => import('src/pages/AccountsApp/AcceptPolicies/AcceptPolicies'),
          },
          // {
          //   index: true,
          //   lazy: () => import('src/pages/AccountsApp/MyApplications/MyApplicationsList'),
          // },
          // {
          //   path: 'my-applications',
          //   children: [
          //     {
          //       index: true,
          //       lazy: () => import('src/pages/AccountsApp/MyApplications/MyApplicationsList'),
          //     },
          //   ],
          // },
          {
            path: "onboard/:onboardingId",
            lazy: () => import("src/pages/AccountsApp/Onboard/OnboardPage")
          },
          // {
          //   path: 'apply/:jobId',
          //   lazy: () => import('src/pages/AccountsApp/Apply'),
          // },
          {
            path: 'account',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/AccountsApp/Account'),
              },
            ],
          },
          // {
          //   path: 'meetings',
          //   children: [
          //     {
          //       index: true,
          //       lazy: () => import('src/pages/AccountsApp/Meetings'),
          //     },
          //   ],
          // },
          // {
          //   path: 'personal-test',
          //   children: [
          //     {
          //       index: true,
          //       lazy: () => import('src/pages/AccountsApp/PersonalTest'),
          //     },
          //   ],
          // },
          {
            path: '/inventory-test',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/AccountsApp/InventoryTest'),
              },
            ],
          },
          // {
          //   path: 'quizzes',
          //   children: [
          //     {
          //       index: true,
          //       lazy: () => import('src/pages/AccountsApp/Quizzes'),
          //     },
          //     {
          //       path: ':assignmentId/take',
          //       lazy: () => import('src/pages/AccountsApp/Quizzes/TakeQuiz'),
          //     },
          //     {
          //       path: ':assignmentId/results',
          //       lazy: () => import('src/pages/AccountsApp/Quizzes/QuizResults'),
          //     },
          //   ],
          // },
          {
            path: 'interviews',
            element: <InterviewProvider >
              <Outlet />
            </InterviewProvider>,
            children: [
              {
                index: true, // /interviews
                lazy: () => import("src/pages/AccountsApp/Interviews"),
              },
              {
                path: ":interviewId", // candidate interviewID
                lazy: () => import("src/pages/AccountsApp/Interviews/CinterviewDetail/InterviewDetail"),
              },
              {
                path: ":interviewId/answer",
                lazy: () => import("src/pages/AccountsApp/Answer/InterviewQuestion"),
              },
            ],
          }
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
      // {
      //   path: 'reset-password',
      //   lazy: () => import('src/pages/CompanyApp/Auth/ResetPassword'),
      // },
      // {
      //   path: 'forgot-password',
      //   lazy: () => import('src/pages/CompanyApp/Auth/ForgotPassword'),
      // },
      {
        path: 'login',
        lazy: () => import('src/pages/CompanyApp/Auth/Login'),
      },

      // {
      //   path: 'register',
      //   lazy: () => import('src/pages/CompanyApp/Auth/Register'),
      // },
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

export default AccountsAppRoutes;
