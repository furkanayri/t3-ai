import type { Invoice } from 'src/types/Invoice';

const now = new Date();

export const invoices: Invoice[] = [
  {
    id: '5ece2cef3e562cbd61996259',
    currency: '$',
    description: 'Freelancer Subscription (12/05/2019 - 11/06/2019)',
    issueDate: now.getTime(),
    number: 5345,
    paymentMethod: 'Credit Card',
    status: 'paid',
    value: 5.25,
  },
  {
    id: '5ece2cf461b9484866f2968c',
    currency: '$',
    description: 'Freelancer Subscription (12/05/2019 - 11/06/2019)',
    issueDate: now.getTime(),
    number: 4596,
    paymentMethod: 'Credit Card',
    status: 'paid',
    value: 5.25,
  },
];
