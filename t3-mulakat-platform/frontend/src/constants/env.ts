import type { ProjectType } from 'src/types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const PROJECT_TYPE: ProjectType = import.meta.env.VITE_PROJECT_TYPE;

export const CANDIDATE_APP_URL = import.meta.env.VITE_CANDIDATE_APP_URL;

export const VITE_ENV = import.meta.env.VITE_ENV;


export const SDK_KEY = import.meta.env.VITE_SDK_KEY;
export const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_ENDPOINT;
export const USER_EMAIL = import.meta.env.VITE_USER_EMAIL;
export const LEAVE_URL_ACCOUNT = import.meta.env.VITE_LEAVE_URL_ACCOUNT;
export const LEAVE_URL_COMPANY = import.meta.env.VITE_LEAVE_URL_COMPANY;