export type Experience = {
  _id?: string;
  title: string;
  company?: string;
  position?: string;
  jobType: JobType;
  locationType: string;
  country: any;
  city?: any;
  district?: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isOngoing: boolean;
};
//country and city edit and create funcitonality i add any or gives type error
export type JobType =
  | 'fulltime'
  | 'parttime'
  | 'contract'
  | 'temporary'
  | 'voluntarily'
  | 'intern'
  | 'other'
  | '';
