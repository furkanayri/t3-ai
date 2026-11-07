import { companyValidationSchema } from 'src/validations';

export type CompanyForm = typeof companyValidationSchema.__outputType;
