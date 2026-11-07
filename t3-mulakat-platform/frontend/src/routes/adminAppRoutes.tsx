import { Suspense } from 'react';
import { Outlet, type RouteObject } from 'react-router';

import { App } from 'src/app';
import { Layout as AdminLayout } from 'src/layouts/Layout';
import { NotFound } from 'src/notFound';

function AdminLayoutWithOutlet() {
  return (
    <AdminLayout>
      <Suspense>
        <Outlet />
      </Suspense>
    </AdminLayout>
  );
}

const AdminAppRoutes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <AdminLayoutWithOutlet />,
        children: [
          {
            index: true,
            lazy: () => import('src/pages/AdminApp/Dashboard'),
          },
          {
            path: 'account',
            lazy: () => import('src/pages/AdminApp/Account/Account'),
          },
          {
            path: 'tenants',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/AdminApp/Tenants/TenantsList'),
              },
              {
                path: "create",
                lazy: () => import("src/pages/AdminApp/Tenants/CreateTenant")
              },
              {
                path: ":tenantId",
                children: [
                  {
                    path: "edit",
                    lazy: () => import("src/pages/AdminApp/Tenants/EditTenant")
                  }
                ]
              }
            ],
          },
          {
            path: 'members',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/AdminApp/Members/MembersList'),
              }
            ]
          },
          {
            path: 'users',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/AdminApp/Users'),
              },
              {
                path: "create",
                lazy: () => import('src/pages/AdminApp/Users/Create'),
              },
              {
                path: ':id',
                children: [
                  {
                    path: "edit",
                    lazy: () => import('src/pages/AdminApp/Users/Edit'),
                  }
                ]
              }
            ]
          },
          {
            path: 'jobs',
            children: [
              {
                index: true,
                lazy: () => import("src/pages/AdminApp/Jobs/JobList"),
              },
              {
                index: true,
                path: 'create',

                lazy: () => import("src/pages/AdminApp/Jobs/CreateJob"),
              },
              {
                path: ':id',
                lazy: () => import('src/pages/AdminApp/Jobs/DetailJobs'),
                children: [
                  {
                    index: true,
                    lazy: () => import('src/pages/AdminApp/Jobs/DetailJobs/JobDetailPage'),
                  },
                ]
              },
              {
                path: ':id/edit/general-info',
                lazy: () => import('src/pages/AdminApp/Jobs/EditJob/GeneralInfo'),
              },
              {
                path: ':id/edit/content',
                lazy: () => import('src/pages/AdminApp/Jobs/EditJob/Content'),
              },
              {
                path: ':id/edit/candidate-skills',
                lazy: () => import('src/pages/AdminApp/Jobs/EditJob/SkillsForm'),
              },
              {
                path: ':id/edit/form-definitions',
                lazy: () => import('src/pages/AdminApp/Jobs/EditJob/FormDefinitions'),
              },
              {
                path: ':id/edit/applicant-questions',
                lazy: () => import('src/pages/AdminApp/Jobs/EditJob/ApplicantQuestions'),
              },
            ]
          },
          {
            path: "posting-channels",
            lazy: () => import("src/pages/AdminApp/PostingChannels"),
          },
          {
            path: 'settings',
            lazy: () => import('src/pages/AdminApp/CompanySettings/CompanySettings'),
          },
          {
            path: 'candidates',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/AdminApp/Candidates/List'),
              },
              {
                path: ':id',
                children: [
                  {
                    path: 'edit',
                    lazy: () => import('src/pages/AdminApp/Candidates/Edit/Account'),
                  }
                ]
              }
            ]
          },
          {
            path: 'applications',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/AdminApp/Applications/List'),
              },
              {
                path: "create",
                children: [
                  {
                    path: ":id",
                    lazy: () => import("src/pages/AdminApp/Applications/Steps")
                  }
                ]
              }
            ]
          },
          {
            path: 'categories',
            children: [
              {
                index: true,
                lazy: () => import('src/pages/AdminApp/Categories/Categories'),
              },
              {
                path: ":categoryId",
                children: [
                  {
                    path: "jobs",
                    lazy: () => import("src/pages/AdminApp/Categories/sections/JobsByCategory")
                  }
                ]
              }
            ]
          },
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

export default AdminAppRoutes;
