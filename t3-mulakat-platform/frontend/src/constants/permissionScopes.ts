export enum PERMISSION_SCOPES {
    //JOBS
    manage_jobs = "manage_jobs",
    //MEETINGS
    manage_meetings = "manage_meetings",
    //SETTINGS
    company_settings = "company_settings",
    send_emails = "send_emails",
    access_admin_panel = "access_admin_panel",
    //EMPLOYEES
    manage_employees = "manage_employees",
    //DEPARTMENTS
    manage_departments = "manage_departments",
    //POSTING CHANNELS
    list_manageable_posting_channels = "list_manageable_posting_channels",
    //GENERAL
    manage_members = "manage_members",
    get_metrics = "get_metrics",
    manage_recruitment_stage = "manage_recruitment_stage",
    manage_skills = "manage_skills",
    //PERMISSIONS
    list_permissions = "list_permissions",
    manage_permissions = "manage_permissions",
    assign_permission_manage_access = "assign_permission_manage_access"
}

export const PERMISSION_GROUPS = {
    jobs: [
        PERMISSION_SCOPES.manage_jobs,
    ],
    meetings: [
        PERMISSION_SCOPES.manage_meetings,
    ],
    settings: [
        PERMISSION_SCOPES.company_settings,
        PERMISSION_SCOPES.send_emails,
        PERMISSION_SCOPES.access_admin_panel,
    ],
    employees: [
        PERMISSION_SCOPES.manage_employees,
    ],
    departments: [
        PERMISSION_SCOPES.manage_departments,
    ],
    postingChannels: [
        PERMISSION_SCOPES.list_manageable_posting_channels
    ],
    general: [
        PERMISSION_SCOPES.manage_members,
        PERMISSION_SCOPES.get_metrics,
        PERMISSION_SCOPES.manage_recruitment_stage,
        PERMISSION_SCOPES.manage_skills,
    ],
    permissions: [
        PERMISSION_SCOPES.list_permissions,
        PERMISSION_SCOPES.manage_permissions,
        PERMISSION_SCOPES.assign_permission_manage_access,
    ]
}