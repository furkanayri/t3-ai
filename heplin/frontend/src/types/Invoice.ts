export type InvoiceStatus = 'paid';

export interface Invoice {
  id: string;
  currency: string;
  description: string;
  issueDate: number;
  number: number;
  paymentMethod: string;
  status: InvoiceStatus;
  value: number;
}
