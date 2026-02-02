export * from './api/companies';
export * from './api/contacts';
export * from './api/opportunities';
export * from './api/proposals';
export * from './api/agreements';
export * from './api/invoices';
export * from './api/payments';
export * from './api/activities';

export * from './enums/opportunity-status';
export * from './enums/proposal-status';
export * from './enums/agreement-signature-status';
export * from './enums/payment-status';
export type UserId = string;

export interface UserProfile {
  id: UserId;
  name: string;
  email?: string;
}
