import * as yup from 'yup';

export const companyValidationSchema = yup.object().shape({
  name: yup.string().required(),
  legalName: yup.string().required(),
  email: yup.string().required().email(),
  phone: yup.string().required(),
  address: yup.string().required(),
  website: yup.string().required(),
});
