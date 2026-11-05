import { subDays, subHours } from 'date-fns';

export interface Notification {
  _id: string;
  author?: string;
  avatar?: string;
  company?: string;
  createdAt: number;
  description?: string;
  job?: string;
  title?: string;
  read?: boolean;
  type: string;
  link?: string;
  content?: string;
}

const now = new Date();

export const notifications: Notification[] = [

];
