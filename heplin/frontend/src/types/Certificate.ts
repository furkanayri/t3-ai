export type Certificate = {
  _id?: string;
  institution: string;
  degree: string;
  startDate: Date;
  endDate: Date;
  files: Array<{ fileName: string, fileKey: string, uploadDate: Date }>
};
